define([
	"qlik",
	"jquery", 
	"text!./bootstrap.css",
	"text!./senseui-dropdown.css",
	"core.utils/theme",
	"./bootstrap.min",
	"text!./template.html"
], function(qlik, $, cssBootstrap, cssContent, Theme, ngBootstrap, template) {
'use strict';

	// Inject the custom CSS
	$("<style>").html(cssBootstrap).prependTo("head");
	$("<style>").html(cssContent).appendTo("head");


	// Define properties
	var app = {
		initialProperties : {
			version : 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 1,
					qHeight : 1000
				}]
			},
			AllowChanges: false
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 1,
					max : 1
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
							}
						}
					}
				}
			}
		}
	};
	
	// Get Engine API app for Selections
	app.app = qlik.currApp(this);

	// Alter properties on edit		
	app.paint = function($element,layout) {
		// Set height of the drop down
		var me = {
			btnHeight: 50,
			btnBgColor: '#ffffff',
			btnTxtColor: '#333333',
			divPadding: 10,
			divHeight: 400
		}
		// Height of popup
		me.divHeight = $element[0].offsetHeight - me.btnHeight - me.divPadding;
		$('#SenseUI-DropDown .scrollable-menu').css('min-height', me.divHeight+'px');
		$('#SenseUI-DropDown .scrollable-menu').css('max-height', me.divHeight+'px');

		// Button Colors
		me.btnBgColor = (layout.btnBgColorHex !== '') ? layout.btnBgColorHex : Theme.palette[layout.btnBgColor];
		me.btnTxtColor = (layout.btnTxtColorHex !== '') ? layout.btnTxtColorHex : Theme.palette[layout.btnTxtColor];
		$('#SenseUI-DropDown .btn.btn-default').css('background-color', me.btnBgColor);
		$('#SenseUI-DropDown .btn.btn-default').css('color', me.btnTxtColor);

	};

	// define HTML template
	app.template = template;

	// Controller for binding
	app.controller =['$scope', function($scope){
		var self = this;
		var me = {
			btnBgColor: ($scope.$parent.layout.btnBgColorhex) ? $scope.$parent.layout.btnBgColorhex : Theme.palette[$scope.$parent.layout.btnBgColor],
			items: {},
			currentItem: 'Select One',
			dimension: $scope.$parent.layout.qHyperCube.qDimensionInfo[0].qFallbackTitle
		}
		
		// Get Selections
		app.app.getList("SelectionObject", function(reply){
			var selectedFields = reply.qSelectionObject.qSelections;
			if (selectedFields.length >= 1) {
				$.each(selectedFields, function(key, value) {
					console.log(value.qField);
					console.log(me.dimension);
					if (value.qField !== me.dimension) {
						$scope.currentItem = me.currentItem;
						$('#SenseUI-DropDown .scrollable-menu li').removeClass('active');
					}
				});
			} else {			
				$scope.currentItem = me.currentItem;
				$('#SenseUI-DropDown .scrollable-menu li').removeClass('active');
			}

		});

		$.each($scope.$parent.layout.qHyperCube.qDataPages[0].qMatrix, function(key, value) {
			if (typeof value[0].qText !== 'undefined') {
				me.items[key] = value[0];
			}				
		});
		
		$scope.items = me.items;
		$scope.currentItem = me.currentItem;

		$scope.select = function (element) {
			$scope.currentItem = element.item.qText;
			$scope.backendApi.selectValues(0, [element.item.qElemNumber], false);
		}

	}];

	return app;
});
