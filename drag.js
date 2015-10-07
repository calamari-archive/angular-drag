


(function(angular, win) {
  'use strict';

  var vendor        = (/webkit/i).test(navigator.appVersion) ? 'webkit' :
                      (/firefox/i).test(navigator.userAgent) ? 'Moz' :
                      (/trident/i).test(navigator.userAgent) ? 'ms' :
                      'opera' in window ? 'O' : '',
      HAS_3D        = 'WebKitCSSMatrix' in win && 'm11' in new WebKitCSSMatrix(),
      transformJS   = vendor + 'Transform',
      translateCSS  = 'translate' + (HAS_3D ? '3d' : ''),

      queryToParams = function(query, split) {
        split = split || '&';
        var pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = new RegExp('([^' + split + '=]+)=?([^' + split + ']*)', 'g'),
            decode = function(s) { return decodeURIComponent(s.replace(pl, " ")); },
            urlParams = {},
            match;

        while (match = search.exec(query)) {
          urlParams[decode(match[1])] = decode(match[2]);
        }
        return urlParams;
      },

      isNumber = function(number) {
        return typeof number === 'number';
      },

      translate = function(element, x, y) {
        element.style[transformJS] = translateCSS + '(' + (isNumber(x) ? x + 'px' : x) + ',' + (isNumber(y) ? y + 'px' : y) + (HAS_3D ? ',0' : '') + ')';
      },

      getTranslationCoords = function(element) {
        var matrix = getComputedStyle(element, null)[transformJS].replace(/[^0-9-.,]/g, '').split(',');
        return { x: ~~matrix[4], y: ~~matrix[5] };
      };

  angular.module('jaz.drag.directive', [])
    .directive('draggable', ['$document', '$parse', function(doc, parse) {
      return function(scope, element, attr) {
        var box      = element,
            children = element.find('*'),
            params   = box.attr('draggable'),
            releaseHandler, handle, startX, startY, translation;

        function startDrag(event) {
          if (scope._isDragging) { stopDrag(); }
          scope._isDragging = box;
          translation = getTranslationCoords(box[0]);
          startX = event.screenX - translation.x;
          startY = event.screenY - translation.y;
          doc.bind('mousemove', moveDrag);
        }

        function moveDrag(event) {
          var y = event.screenY - startY,
              x = event.screenX - startX;
          translate(element[0], x, y);
        }

        function stopDrag() {
          doc.unbind('mousemove', moveDrag);
          if (scope._isDragging && scope._isDragging._releaseHandler) {
            translation = getTranslationCoords(box[0]);
            box._releaseHandler(scope._isDragging, translation.x, translation.y);
          }
          scope._isDragging = false;
        }

        // own directive?
        function findHandle() {
          if (angular.isUndefined(box.attr('jazHandle'))) {
            handle = box.find('.jaz-handle, [jazHandle]');
          } else if (!box.attr('jazHandle')) {
            handle = box;
          } else {
            handle = box.find(box.attr('jazHandle'));
          }
          if (!handle.length) {
            handle = box;
          }
          handle.addClass('jaz-handle');
        }


        if (params) {
          params = queryToParams(params, ';');
          startX = ~~params.x;
          startY = ~~params.y;
        }

        findHandle();

        // own directive?
        if (box.attr('onDragRelease')) {
          var handlerName = box.attr('onDragRelease').split('(')[0];
          box._releaseHandler = scope.$eval(handlerName);
        }

        translate(box[0], startX, startY);

        handle.bind('mousedown', startDrag);

        doc.bind('mouseup', function() {
          stopDrag();
        });
      };
    }]);
  angular.module('jaz.drag.service', []);
  angular.module('jaz.drag.filter', []);

  angular.module('jaz.drag', ['jaz.drag.directive', 'jaz.drag.service', 'jaz.drag.filter']);

}(angular, window));

// EXAMPLE:
window.DragController = function($scope) {
  $scope.onDrag = function(element, x, y) {
    console.log("GO?", arguments);
  };
  $scope.onDrag2 = function(element, x, y) {
    console.log("GO2?", arguments);
  };
};

