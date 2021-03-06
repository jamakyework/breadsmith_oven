myApp.controller('adminStaffController', ['$scope', '$http', '$window', 'AuthFactory', "ngDialog",
function($scope, $http, $window, AuthFactory, ngDialog) {
  $scope.showStaff = function() {
    $http({
      method: 'GET',
      url: '/staff',
    }).then(function successCallback(response) {
      console.log(response);
      $scope.staffView = response.data;
    }).catch(function errorCallback(error) {
      console.log('error', error);
    });//end GET
  }; //end $scope.showStaff
  $scope.showStaff();

  $scope.updateStaff = function() {
    console.log("updating", $scope.staffToEdit);
    var objectToSend =  $scope.staffToEdit;
    console.log("sending:", objectToSend);
    $http({
      method: "PUT",
      url: "/staff",
      data: objectToSend
    }).then(function(response) {
      console.log(response);
      $scope.showStaff();
      $scope.success = true;
      $scope.modalBody = 'Staff member updated.';
      ngDialog.open({
          template: 'responseModal',
          scope: $scope
      });
    }).catch(function(error){
      console.log(error);
    });//end PUT
  }; //end $scope.editStaff

  $scope.storeStaff = function(staff) {
    $scope.staffToEdit = JSON.parse(JSON.stringify(staff));
    console.log("staffToEdit:", $scope.staffToEdit);
  };//end $scope.storeStaff

  $scope.deleteStaff = function(){
    var toDelete = $scope.staffToEdit.id;
    console.log('deleting:', toDelete);
    $http({
      method: 'DELETE',
      url: '/staff/' + toDelete,
      data: toDelete
    }).then(function(response){
      console.log(response);
      $scope.showStaff();
      $scope.success = true;
      $scope.modalBody = 'Staff member deleted.';
      ngDialog.open({
          template: 'responseModal',
          scope: $scope
      });

    }).catch(function(error){
      console.log(error);
    });
  };//end $scope.deleteStaff


  $scope.addStaff = function(){
    console.log('adding staff');
    var staffToSend = {
      first_name: $scope.addFirst,
      last_name: $scope.addLast,
      email: $scope.addEmail,
      role: $scope.addRole
    };//end staffToSend
    $http({
      method: 'POST',
      url: '/staff',
      data: staffToSend
    }).then(function(response){
      console.log(response);
      $scope.clearAdd();
      $scope.showStaff();
      $scope.success = true;
      $scope.modalBody = 'Staff member added.';
      ngDialog.open({
          template: 'responseModal',
          scope: $scope
      });
    }).catch(function(error){
      console.log('problem adding:', error);
    });
  };//end $scope.addStaff

  //--clear fields if user closes add modal--//
  $scope.clearAdd=function(){
    $scope.addFirst = '';
    $scope.addLast = '';
    $scope.addEmail = '';
  };//end $scope.clearAdd
  $scope.addRole = "admin";
}]);
