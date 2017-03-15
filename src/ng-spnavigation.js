/**
*
Uses metadata for global navigation in Sharepoint Online
*/
angular.module('ngSpNavigation', ['webdotnet.sharepoint', 'ngAnimate', 'ui.bootstrap'])
.value('templatePath', (function () {
    //As described in http://stackoverflow.com/questions/21103724/angular-directive-templateurl-relative-to-js-file
    var scripts = document.getElementsByTagName("script");
    var scriptPath = scripts[scripts.length - 1].src;
    return scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1)
})())
.service('ManagedNavigationService', ['$q', 'spTaxonomyManager', function($q, spTaxonomyManager){
    this.getTerms = function(termSetName){
        var deferred = $q.defer();
        var taxonomyManager = new spTaxonomyManager();
        var promise = taxonomyManager.getAllTermsByTermSet({termSetName: termSetName, raw: false, include: 'Include(Parent)'})
        promise.then(function(data){
            generateListOfChildren(data);
            var tmp = [];
            angular.forEach(data, function(t){
                if(t.get_isRoot()){
                    tmp.push(t);
                }
            });
            deferred.resolve(tmp);
        },
        function(err){
            $log.log("Error getting terms", err);
            deferred.reject(err);
        });

        var generateListOfChildren = function(terms){
            var termsMap = {};
            var l = terms.length;
            for(var i=0; i<l; i++){
                var t = terms[i];
                termsMap[t.get_id().toString()] = t;
            }
            var l = terms.length;
            for(var i=0; i<l; i++){
                var t = terms[i];
                if(!t.get_isRoot()){
                    var p = t.get_parent();
                    if(p){
                        var tInMap = termsMap[p.get_id().toString()];
                        if(tInMap){
                            if(!tInMap.subtree){
                                tInMap.subtree = [];
                            }

                            tInMap.subtree.push(t);
                        }
                    }
                }
            }
        }
        return deferred.promise;
    }
}])
.controller('ManagedNavigationController', ['$scope', 'ManagedNavigationService', '$log', '$attrs', '$window', function($scope, ManagedNavigationService, $log, $attrs, $window){

    $scope.tree = [];
    
    var promise = ManagedNavigationService.getTerms($attrs.termSetName);
    promise.then(function(terms){
        $scope.tree = terms;
    })
    
}])
.directive('webdotnetTree', ['templatePath', function (templatePath) {
    return {
        restrict: 'AE',
        controller: ['$scope', '$attrs', 'ManagedNavigationService', function($scope, $attrs, ManagedNavigationService){
            $scope.tree = [];
            var promise = ManagedNavigationService.getTerms($attrs.termSetName);
            promise.then(function(terms){
                $scope.tree = terms;
            })

        }],
        templateUrl: templatePath+'navbar-ul.html',
        link: function (scope, element, attrs) {

        }
    };
}])
.directive('webdotnetLeaf', ['$compile', 'templatePath', function ($compile, templatePath) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            leaf: '='
        },
        controller: ['$scope', '$attrs', '$element', '$window', '$timeout', function($scope, $attrs, $element, $window, $timeout){
            this.getElement = function(){
                return $element;
            }

            var closePromise;
            var closeDelayMs = 300;

            $scope.openDropdown = function(){
                if(closePromise){
                    $timeout.cancel(closePromise);
                    closePromise = null;
                }
                if($window.innerWidth >= 768){
                    $scope.status.isOpen = true;
                }
            }
            $scope.closeDropdown = function(){
                if($window.innerWidth >= 768){
                    if(closePromise){
                        $timeout.cancel(closePromise);
                        closePromise = null;
                    }
                    closePromise = $timeout(function(){
                        $scope.status.isOpen = false;
                    }, closeDelayMs);
                }   
            }
        }], 
        templateUrl: templatePath+'navbar-li.html',
        link: function (scope, element, attrs) {

            scope.$watch("leaf.get_customProperties()", function(newProps){
                if(newProps && newProps['OpenInNewWindow']){
                    element.find('a').attr('target', '_blank');
                }
            });

            

            if (angular.isArray(scope.leaf.subtree)) {
                element.append('<div data-webdotnet-dropdown data-tree=\"leaf.subtree\"></div>');
                $compile(element.contents())(scope);
            }
        }
    };
}])
.directive('webdotnetDropdown', ['$timeout', function ($timeout) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            "tree": '='
        },
        require: 
            '^webdotnetLeaf'
        ,
        controller: ['$element', '$scope', function($element, $scope){
            this.getElement = function(){
                return $element;
            }

        }],
        template: "<div ng-mouseleave=\"$parent.closeDropdown()\" class=\"dropdown-menu\" uib-dropdown-menu ng-class=\"{'dropdown-menu-right':menuAlignRight}\"><ul class=\"menu-list\"><li data-webdotnet-dropdown-leaf data-ng-repeat='leaf in tree' data-leaf='leaf'></li></ul></div>",
        link: function(scope, element, attrs, controller){
            
            // 2 step strategy 
            
            // 1. if there is more space on the left hand side of the screen then use that space 
            var buttonRect = controller.getElement()[0].getBoundingClientRect();
            var distanceToLeft = (buttonRect.right - window.pageXOffset - document.body.clientLeft);
            var distanceToRight = window.innerWidth - (buttonRect.left - window.pageXOffset - document.body.clientLeft);
            
            var widthAvailable = distanceToRight;
            if(distanceToLeft > distanceToRight){
                element.addClass('dropdown-menu-right');
                widthAvailable = distanceToLeft;
            }

            
            var getRectForHiddenElements = function(elem){
                var prevStyle = elem.attr('style');
                elem.css({
                    visibility: 'hidden',
                    display:    'block'
                });
                var elementRect = elem[0].getBoundingClientRect();
                elem.attr('style', prevStyle || '');
                return elementRect;
            }

            //2. if the resulting element is too long (i.e causes horiz scrollbar), try turning into columns 
            $timeout(function(){
                var rect = getRectForHiddenElements(element);
                if(rect.bottom > window.innerHeight){
                    // 
                    var extraCushioning = 50;
                    var width = widthAvailable-20-extraCushioning;


                    element.css('width', width+'px');
                    element.addClass('columnified');
                }
                
            })

            

        }
    };
}])
.directive('webdotnetDropdownLeaf', ['$compile', function ($compile) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            "leaf": '='
        },
        template: '<li><a class="leaf" ng-href="{{leaf.get_localCustomProperties()[\'_Sys_Nav_SimpleLinkUrl\']}}">{{leaf.get_name()}}</a></li>',
        link: function (scope, element, attrs, ctrl) {
            var props = scope.leaf.get_customProperties();

            if(props && props['OpenInNewWindow']){
                element.find('a').attr('target', '_blank');
            }

            if (angular.isArray(scope.leaf.subtree)) {
                element.append('<div data-webdotnet-plain-tree data-tree=\"leaf.subtree\"></div>');
                $compile(element.contents())(scope);
            }
        }
    };
}])
.directive('webdotnetPlainTree', [function () {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            "tree": '='
        },
        template: "<ul class='plain-tree'><li class='plain-leaf' data-webdotnet-plain-leaf data-ng-repeat='leaf in tree' data-leaf='leaf'></li></ul>"
    };
}])
.directive('webdotnetPlainLeaf', ['$compile', function ($compile) {  
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            leaf: '='
        },
        template: '<li><a ng-href="{{leaf.get_localCustomProperties()[\'_Sys_Nav_SimpleLinkUrl\']}}">{{leaf.get_name()}}</a></li>',
        link: function (scope, element, attrs, ctrl) {
            if (angular.isArray(scope.leaf.subtree)) {
                element.append('<div data-webdotnet-plain-tree data-tree=\"leaf.subtree\"></div>');
                $compile(element.contents())(scope);
            }
        }
    };
}])
.directive('webdotnetMobileLeftNav', ['$timeout', function ($timeout) {
    return {
        restrict: 'AE',
        template: '<span class="pull-left visible-xs toggle-burger-menu" data-toggle="offcanvas"><span class="glyphicon glyphicon-menu-hamburger"></span></span>',
        link: function (scope, element, attrs) {
            $timeout(function () {
                var navigation = document.querySelector(".leftNav").parentNode;
                var navigationClone = navigation.cloneNode(true);
                navigationClone.className = "visible-xs sidebar-offcanvas left-nav-mobile";

                var container = document.querySelector("#s4-bodyContainer");
                container.className = "row-offcanvas row-offcanvas-left";
                container.insertBefore(navigationClone, container.firstChild);

                var mobileNavigation = document.querySelector(".left-nav-mobile .leftNav .parentNode").firstChild;
                var closeBtn = document.createElement("span");
                closeBtn.className = "glyphicon glyphicon-remove btn-close";
                closeBtn.setAttribute('data-toggle', 'offcanvas');
                closeBtn.addEventListener('click', toggleNavigation);

                mobileNavigation.insertBefore(closeBtn, mobileNavigation.firstChild);

                element.children().on('click', toggleNavigation);

                function toggleNavigation () {
                    document.querySelector('.row-offcanvas').classList.toggle('active');
                }
            });
        }
    };
}]);
