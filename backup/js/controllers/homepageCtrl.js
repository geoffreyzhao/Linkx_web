controllers.controller('homepageController', ['$scope', '$cookies',
function($scope, $cookies) {
    //the code below this line just for test
    if ($cookies.user) {
        $scope.userName = JSON.parse($cookies.user).userName;
    }
}]);