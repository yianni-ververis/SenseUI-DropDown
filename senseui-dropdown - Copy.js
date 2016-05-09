define([
	"qlik",
	"jquery",
	"qvangular",
	'underscore',
	"core.utils/theme",
	"./bootstrap.min",
	"css!./bootstrap.css",
	"css!./senseui-dropdown.css",
], function(qlik, $, qvangular, _, Theme, ngBootstrap) {
'use strict';

	// Define properties
	var me = {
		initialProperties: {
			version: 1.0,
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 2,
					qHeight: 100
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					max: 1
				},
				measures: {
					uses: "measures",
					min: 1,
					max: 1
				},
				sorting : {
					uses : "sorting"
				},
				settings : {
					uses : "settings",
					items: {
						Chart: {
							type: "items",
							label: "Settings",
							items: {
								btnBgColor: {
									type: "string",
									expression: "optional",
									component: "color-picker",
									label: "Button Background Color",
									ref: "btnBgColor",
									defaultValue: 10
								},
								btnTxtColor: {
									type: "string",
									expression: "optional",
									component: "color-picker",
									label: "Button Text Color",
									ref: "btnTxtColor",
									defaultValue: 11
								},
								btnBgColorHex: {
									type: "string",
									label: "Custom Background Color (HEX)",
									ref: "btnBgColorHex",
									defaultValue: ''
								},
								btnTxtColorHex: {
									type: "string",
									label: "Custom Text Color (HEX)",
									ref: "btnTxtColorHex",
									defaultValue: ''
								},
								btnLabel: {
									type: "string",
									label: "Button Label",
									ref: "btnLabel",
									defaultValue: 'Select Text'
								},
							}
						}
					}
				}
			}
		}
	};
	
	// Get Engine API app for Selections
	me.app = qlik.currApp(this);

	// Alter properties on edit		
	me.paint = function($element,layout) {
		// Set height of the drop down
		var vars = {
			id: layout.qInfo.qId,
			data: layout.qHyperCube.qDataPages[0].qMatrix,
			btnHeight: 50,
			btnBgColor: '#ffffff',
			btnTxtColor: '#333333',
			divPadding: 10,
			divHeight: 400,
		}
		
		// Height of popup
		vars.divHeight = $element[0].offsetHeight - vars.btnHeight - vars.divPadding;
		$('#SenseUI-DropDown .scrollable-menu').css('min-height', vars.divHeight+'px');
		$('#SenseUI-DropDown .scrollable-menu').css('max-height', vars.divHeight+'px');

		// Button Colors
		vars.btnBgColor = (layout.btnBgColorHex !== '') ? layout.btnBgColorHex : Theme.palette[layout.btnBgColor];
		vars.btnTxtColor = (layout.btnTxtColorHex !== '') ? layout.btnTxtColorHex : Theme.palette[layout.btnTxtColor];
		$('#SenseUI-DropDown .btn.btn-default').css('background-color', vars.btnBgColor);
		$('#SenseUI-DropDown .btn.btn-default').css('color', vars.btnTxtColor);
	};

	// define HTML template	
	me.template = '\
		<div qv-extension class="ng-scope" id="SenseUI-DropDown">\n\
			<div class="dropdown">\n\
				<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">\n\
					{{currentItem}} <span class="caret"></span>\n\
				</button>\n\
				<ul class="dropdown-menu scrollable-menu" aria-labelledby="dropdownMenu1">\n\
					<li ng-repeat="item in items" ng-class="(item.qText===currentItem) ? \'active\' : \'\' ">\n\
						<a ng-click="select(this)">{{item.qText}}</a>\n\
					</li>\n\
				</ul>\n\
			</div>\n\
		</div>\n\
	';

	// Controller for binding
	me.controller =['$scope', function($scope){
		console.log($scope.$parent.layout)
		var field = $scope.$parent.layout.qHyperCube.qFallbackTitle;
		var object = $scope.$parent.layout.qHyperCube.qDataPages[0].qMatrix;

		var self = this;
		var vars = {
			items: {},
			currentItem: $scope.$parent.layout.btnLabel,
			dimension: field
		}

		// Get Selections
		me.app.getList("SelectionObject", function(reply){
			var selectedFields = reply.qSelectionObject.qSelections;

			if (selectedFields.length >= 1) {
				$.each(selectedFields, function(key, value) {
					if (value.qField !== vars.dimension) {
						$scope.currentItem = vars.currentItem;
						$('#SenseUI-DropDown .scrollable-menu li').removeClass('active');
					} else {
						$scope.currentItem = selectedFields[0].qSelectedFieldSelectionInfo[0].qName;
					}
				});
			} else {			
				$scope.currentItem = $scope.$parent.layout.btnLabel;
				$('#SenseUI-DropDown .scrollable-menu li').removeClass('active');
			}
		});

		$.each(object, function(key, value) {
			if (typeof value[0].qText !== 'undefined') {
				vars.items[key] = value[0];
			}				
		});

		$scope.items = vars.items;
		$scope.currentItem = vars.currentItem;

		$scope.select = function (element) {
			vars.currentItem = $scope.currentItem = element.item.qText;
			$scope.backendApi.selectValues(0, [element.item.qElemNumber], false);
		}

	}];

	return me;
});
