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
									ref: "vars.btnBgColor",
									defaultValue: 10
								},
								btnTxtColor: {
									type: "string",
									expression: "optional",
									component: "color-picker",
									label: "Button Text Color",
									ref: "vars.btnTxtColor",
									defaultValue: 11
								},
								btnBgColorHex: {
									type: "string",
									label: "Custom Background Color (HEX)",
									ref: "vars.btnBgColorHex",
									defaultValue: ''
								},
								btnTxtColorHex: {
									type: "string",
									label: "Custom Text Color (HEX)",
									ref: "vars.btnTxtColorHex",
									defaultValue: ''
								},
								MultipleSelections: {
									type: "boolean",
									component: "switch",
									label: "Multiple Selections",
									ref: "vars.multipleSelections",
									options: [{
										value: true,
										label: "On"
									}, {
										value: false,
										label: "Off"
									}],
									defaultValue: false
								},
								btnLabel: {
									type: "string",
									label: "Button Label",
									ref: "vars.btnLabel",
									defaultValue: 'Select Text'
								},
								rowTextColor: {
									type: "string",
									expression: "none",
									label: "Text color",
									defaultValue: "#000000",
									ref: "vars.row.textColor"
								},
								rowTextHoverColor: {
									type: "string",
									expression: "none",
									label: "Text hover color",
									defaultValue: "#FFFFFF",
									ref: "vars.row.textHoverColor"
								},
								rowBackgroundColor: {
									type: "string",
									expression: "none",
									label: "Background color",
									defaultValue: "#FFFFFF",
									ref: "vars.row.backgroundColor"
								},
								rowBackgroundDeactiveColor: {
									type: "string",
									expression: "none",
									label: "Background deactived color",
									defaultValue: "#CCCCCC",
									ref: "vars.row.backgroundDeactiveColor"
								},
								rowBackgroundHoverColor: {
									type: "string",
									expression: "none",
									label: "Background hover color",
									defaultValue: "#77b62a",
									ref: "vars.row.backgroundHoverColor"
								},
								popupHeight: {
									type: "string",
									expression: "none",
									label: "Popup Height",
									defaultValue: 200,
									ref: "vars.popupHeight"
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
			field: layout.qHyperCube.qDimensionInfo[0].qFallbackTitle,
			data: layout.qHyperCube.qDataPages[0].qMatrix,
			height: $element.height(),
			width: $element.width(),
			this: this,
			multipleSelections: (layout.vars.multipleSelections) ? true : false,
			btnHeight: 50,
			btnBgColor: (layout.vars.btnBgColor) ? layout.vars.btnBgColor : '#ffffff',
			btnLabel: (layout.vars.btnLabel) ? layout.vars.btnLabel : 'Select Text',
			row: {
				textColor: (layout.vars.row.textColor)?layout.vars.row.textColor:'#000000',
				textHoverColor: (layout.vars.row.textHoverColor)?layout.vars.row.textHoverColor:'#FFFFFF',
				backgroundColor: (layout.vars.row.backgroundColor)?layout.vars.row.backgroundColor:'#FFFFFF',
				backgroundHoverColor: (layout.vars.row.backgroundHoverColor)?layout.vars.row.backgroundHoverColor:'#77b62a',
			},
			btnTxtColor: '#333333',
			divPadding: 10,
			popupHeight: (layout.vars.popupHeight)?layout.vars.popupHeight: 200,
		}
		
		vars.data = vars.data.map(function(d) {
			return {
				"dimension":d[0].qText,
				"measure":d[1].qText,
				"measureNum":d[1].qNum,
				"qElemNumber":d[0].qElemNumber,
				"qState":d[0].qState,
			}
		});

		//Get Selection Bar
		me.app.getList("SelectionObject", function(reply){
			var selectedFields = reply.qSelectionObject.qSelections;
			var selected = _.where(selectedFields, {'qField': vars.field});
			if (selected.length) {
				var selectedInfo = selected[0].qSelectedFieldSelectionInfo;
				for (i = 0; i < selectedInfo.length; i++) { 
					layout.vars.selected = selectedInfo[i].qName;
					// $('#' + vars.id + '_senseui_dropdown button').html(selectedInfo[i].qName + ' <span class="caret"></span>')
					// $( '#' + vars.id + '_filter a:contains("' + selectedInfo[i].qName + '")' ).css( "color", vars.row.textHoverColor );
					// $( '#' + vars.id + '_filter a:contains("' + selectedInfo[i].qName + '")' ).css( "background-color", vars.row.backgroundHoverColor );
					// $( '#' + vars.id + '_filter a:contains("' + selectedInfo[i].qName + '")' ).unbind('mouseenter mouseleave');
				}
			} else {
				layout.vars.selected = null;
			}
		});

		if (layout.vars.selected) {
			vars.btnLabel = layout.vars.selected
		}

		vars.template = '\
			<div qv-extension class="senseui-dropdown" id="' + vars.id + '_senseui_dropdown">\
				<div class="dropdown">\n\
					<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">\n\
						' + vars.btnLabel + ' <span class="caret"></span>\n\
					</button>\n\
					<ul class="dropdown-menu scrollable-menu" aria-labelledby="dropdownMenu1">\n\
		';

		for (var i=0; i < vars.data.length; i++) {
			var cssClass = (vars.data[i].qState=='S')?'active':'';
			vars.template += '<li class="' + cssClass + '"><a data-qElemNumber="' + vars.data[i].qElemNumber + '">' + vars.data[i].dimension + '</a></li>'; 
		}

		vars.template += '\
					</ul>\n\
				</div>\n\
			</div>\n\
		';

		$element.html(vars.template);

		$( '#' + vars.id + '_senseui_dropdown a' ).click(function(e) {
			var qElemNumber = parseInt(this.getAttribute('data-qElemNumber'));
			vars.this.backendApi.selectValues(0, [qElemNumber], vars.multipleSelections);
		});

		// CSS
		$( '#' + vars.id + '_senseui_dropdown li.active a' ).css( "color", vars.row.textHoverColor );
		$( '#' + vars.id + '_senseui_dropdown li.active' ).css( "background-color", vars.row.backgroundHoverColor );
		$( '#' + vars.id + '_senseui_dropdown li.deactive' ).css( "background-color", vars.row.backgroundDeactiveColor );
		$( "#" + vars.id + "_senseui_dropdown li:not(.active,.deactive) a" ).hover(
			function() {
				$(this).css("color", vars.row.textHoverColor );
				$(this).css("background-color", vars.row.backgroundHoverColor);
			}, function() {
				$(this).css("color", vars.row.textColor );
				$(this).css("background-color", vars.row.backgroundColor);
			}
		);
console.log(vars.id);
console.log(vars.popupHeight);
		// Height of popup
		// vars.popupHeight = $element[0].offsetHeight - vars.btnHeight - vars.divPadding;
		// $('#SenseUI-DropDown .scrollable-menu').css('min-height', vars.popupHeight+'px');
		// $('#SenseUI-DropDown .scrollable-menu').css('max-height', vars.popupHeight+'px');
		// $( '#KfgBJXX_senseui_dropdown .scrollable-menu' ).css( "height", 200); 
		$( '#' + vars.id + '_senseui_dropdown .scrollable-menu' ).css( "height", vars.popupHeight); 
		// Button Colors
		vars.btnBgColor = (layout.btnBgColorHex !== '') ? layout.btnBgColorHex : Theme.palette[layout.btnBgColor];
		vars.btnTxtColor = (layout.btnTxtColorHex !== '') ? layout.btnTxtColorHex : Theme.palette[layout.btnTxtColor];
		$('#SenseUI-DropDown .btn.btn-default').css('background-color', vars.btnBgColor);
		$('#SenseUI-DropDown .btn.btn-default').css('color', vars.btnTxtColor);
		//hack to show the popup on top of the container
		$( 'div[tid="' + vars.id + '"] article' ).css( "overflow", 'visible' );
	};

	// define HTML template	
	// me.template = '\
	// 	<div qv-extension class="ng-scope" id="SenseUI-DropDown">\n\
	// 		<div class="dropdown">\n\
	// 			<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">\n\
	// 				{{currentItem}} <span class="caret"></span>\n\
	// 			</button>\n\
	// 			<ul class="dropdown-menu scrollable-menu" aria-labelledby="dropdownMenu1">\n\
	// 				<li ng-repeat="item in items" ng-class="(item.qText===currentItem) ? \'active\' : \'\' ">\n\
	// 					<a ng-click="select(this)">{{item.qText}}</a>\n\
	// 				</li>\n\
	// 			</ul>\n\
	// 		</div>\n\
	// 	</div>\n\
	// ';

	// Controller for binding
	me.controller =['$scope', function($scope){
		// console.log($scope.$parent.layout)
		// var field = $scope.$parent.layout.qHyperCube.qFallbackTitle;
		// var object = $scope.$parent.layout.qHyperCube.qDataPages[0].qMatrix;

		// var self = this;
		// var vars = {
		// 	items: {},
		// 	currentItem: $scope.$parent.layout.btnLabel,
		// 	dimension: field
		// }

		// // Get Selections
		// me.app.getList("SelectionObject", function(reply){
		// 	var selectedFields = reply.qSelectionObject.qSelections;

		// 	if (selectedFields.length >= 1) {
		// 		$.each(selectedFields, function(key, value) {
		// 			if (value.qField !== vars.dimension) {
		// 				$scope.currentItem = vars.currentItem;
		// 				$('#SenseUI-DropDown .scrollable-menu li').removeClass('active');
		// 			} else {
		// 				$scope.currentItem = selectedFields[0].qSelectedFieldSelectionInfo[0].qName;
		// 			}
		// 		});
		// 	} else {			
		// 		$scope.currentItem = $scope.$parent.layout.btnLabel;
		// 		$('#SenseUI-DropDown .scrollable-menu li').removeClass('active');
		// 	}
		// });

		// $.each(object, function(key, value) {
		// 	if (typeof value[0].qText !== 'undefined') {
		// 		vars.items[key] = value[0];
		// 	}				
		// });

		// $scope.items = vars.items;
		// $scope.currentItem = vars.currentItem;

		// $scope.select = function (element) {
		// 	$scope.backendApi.selectValues(0, [element.item.qElemNumber], false);
		// }

	}];

	return me;
});
