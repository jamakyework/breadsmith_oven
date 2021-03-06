const knex = require('../database/dbConfig');

function getOrders() {
    return new Promise((resolve, reject) => {
        knex
            .select()
            .from('orders')
            .join('order_items', 'orders.id', 'order_id')
            .join('products', 'product_id', 'products.id')
            .join('customers', 'customer_id', 'customers.id')
            .then(result => resolve(separateOrders(result)))
            .catch(err => reject(err));
    });
}

function getOrdersByDate(date) {
    endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    return new Promise((resolve, reject) => {
        knex
            .select()
            .from('orders')
            .join('order_items', 'orders.id', 'order_id')
            .join('products', 'product_id', 'products.id')
            .join('customers', 'customer_id', 'customers.id')
            .where('created', '>', date)
            .andWhere('created', '<', endDate)
            .then(result => resolve(separateOrders(result)))
            .catch(err => reject(err));
    });
}

function addOrder(order) {
    return new Promise((resolve, reject) => {
        console.log(order.products);
        let orderToInsert = {
            comments: order.comments,
            status: order.status,
            created: order.created || new Date(),
            total_qty: order.products.reduce((sum, prod) => sum + prod.qty, 0),
            total_cost: order.products.reduce(
                (sum, prod) => sum + prod.price * prod.qty,
                0
            ),
            customer_id: order.customer_id
        };
        if (orderToInsert.total_qty > 0) {
            knex
                .insert(orderToInsert, 'id')
                .into('orders')
                .then(order_id => {
                    let order_items = order.products.reduce(
                        (arr, prod) => {
                            if (prod.qty > 0) {
                                arr.push(
                                    knex
                                        .insert({
                                            order_id: order_id[0],
                                            product_id: prod.id,
                                            qty: prod.qty
                                        })
                                        .into('order_items')
                                );
                            }
                            return arr;
                        },
                        []
                    );
                    Promise.all(order_items)
                        .then(() => resolve(order_id[0]))
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        } else {
            reject('Not generating an order with 0 items');
        }
    });
}

function addRecurringOrder(order, days) {
    let productsToAdd = order.products.reduce(
        (arr, prod) => {
            console.log('arr before:', arr);
            let innerArr = days.map(day => {
                return {
                    customer_id: order.customer_id,
                    product_id: prod.id,
                    qty: prod.qty,
                    recur_day: day
                };
            });
            console.log('inner arr:', innerArr);
            return arr.concat(innerArr);
        },
        []
    );
    console.log('products:', productsToAdd);
    return knex.insert(productsToAdd).into('recurring_order_items');
}

function editOrder(order) {
    return new Promise((resolve, reject) => {
        let delete_items = knex
            .from('order_items')
            .where('order_id', order.id)
            .delete();
        let insert_items = knex
            .insert(
                order.products.map(prod => {
                    return {
                        order_id: order.id,
                        product_id: prod.id,
                        qty: prod.qty
                    };
                })
            )
            .into('order_items');
        order.total_qty = order.products.reduce(
            (sum, prod) => sum + prod.qty,
            0
        );
        order.total_cost = order.products.reduce(
            (sum, prod) => sum + prod.price * prod.qty,
            0
        );
        order = {
            id: order.id,
            total_cost: order.total_cost,
            total_qty: order.total_qty,
            created: order.created,
            status: order.status,
            comments: order.comments,
            customer_id: order.customer_id
        };
        let update = knex.update(order).from('orders').where('id', order.id);
        Promise.all([delete_items, insert_items, update])
            .then(() => resolve())
            .catch(err => reject(err));
    });
}

function confirmOrder(orderId) {
    return knex.update('status', true).from('orders').where('id', orderId);
}

function deleteOrder(orderId) {
    return knex.from('orders').where('id', orderId).delete();
}

module.exports = {
    addOrder: addOrder,
    getOrders: getOrders,
    getOrdersByDate: getOrdersByDate,
    editOrder: editOrder,
    confirmOrder: confirmOrder,
    deleteOrder: deleteOrder,
    addRecurringOrder: addRecurringOrder,
    _aggregateOrder: aggregateOrder,
    _separateOrders: separateOrders
};

function aggregateOrder(results) {
    return results.reduce(
        (obj, row) => {
            obj.id = row.order_id;
            obj.customer_id = row.customer_id;
            obj.customer_name = row.name;
            obj.customer_address = row.address;
            obj.primary_contact_name = row.primary_contact_name;
            obj.secondary_contact_name = row.secondary_contact_name;
            obj.primary_email = row.primary_email;
            obj.secondary_email = row.secondary_email;
            obj.total_qty = row.total_qty;
            obj.total_cost = row.total_cost;
            obj.created = row.created;
            obj.status = row.status;
            obj.comments = row.comments;
            obj.products.push({
                id: row.product_id,
                qty: row.qty,
                price: row.price,
                type: row.type,
                variety: row.variety
            });
            return obj;
        },
        {products: []}
    );
}

function separateOrders(results) {
    let orders = results.reduce(
        (arr, ord) => {
            let orderRow = arr.find(row => row[0].order_id === ord.order_id);
            if (orderRow) {
                orderRow.push(ord);
            } else {
                arr.push([ord]);
            }
            return arr;
        },
        []
    );
    return orders.map(cust => aggregateOrder(cust));
}
