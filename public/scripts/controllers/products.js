myApp.controller("productRead", ["$scope", "$http", "$window", function($scope, $http, $window) {
  var show = false;
  $scope.show = show; //hides the list before fetching(Will remove later)
  console.log("Products page");

  $scope.getProducts = function() {
    $http({
      method: "GET",
      url: "/product"
    }).then(function(res) {
      console.log(res.data);
      array = res.data;
      $scope.list = res.data; //puts the products on the page
      show = true; //prepares the list to be shown
      $scope.show = show; //And shows it
    }); //end GET
  }; //end $scope.getProducts

  $scope.storeInfo = function(product) {
    $scope.productToEdit = JSON.parse(JSON.stringify(product));
    console.log("productToEdit:", $scope.productToEdit);
  };//end $scope.storeInfo

  $scope.editProduct = function() {
    console.log("editing:", $scope.productToEdit);
    var obj = $scope.productToEdit;
    $http({
      method: "PUT",
      url: "/product",
      data: obj
    }).then(function(res) {
      console.log(res);
      $scope.getProducts();
    }); //end PUT
  }; //end $scope.editProduct

  $scope.deleteProduct = function() {
    var delObj = $scope.productToEdit.id;
    console.log("deleting:", delObj);
    $http({
      method: "DELETE",
      url: "/product/" + delObj,
      data: delObj
    }).then(function(res) {
      console.log(res);
      $scope.getProducts();
    }); //end DELETE
  }; //end $scope.deleteProduct
  $scope.getProducts();

  $scope.newProduct = function() {
    var nObj = {
      type: $scope.newName,
      variety: $scope.newVariety,
      price: $scope.newPrice
    };//end nObj
    $http({
      method: "POST",
      url: "/product",
      data: nObj
    }).then(function(res) {
      console.log("Post call response", res);
      $scope.newName = "";
      $scope.newVariety = "";
      $scope.newPrice = "";
      $scope.getProducts();
    });//end POST
  };//end $scope.newProduct

  $scope.clearCreate=function(){
    $scope.newName = '';
    $scope.newVariety = '';
    $scope.newPrice = '';
  };//end $scope.clearCreate

  // var eObj = {};
  // $scope.test = function() {
  //     console.log(this);
  //     console.log(eObj);
  // }; //end test
}]);
