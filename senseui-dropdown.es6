
define([
	"qlik",
	"jquery",
	"qvangular",
	'underscore',
	// "core.utils/theme",  // For Qlik Sense < 3.1.2
	"text!themes/old/sense/theme.json", // For Qlik Sense >= 3.1.2
	"./bootstrapv4/util",
	"./bootstrapv4/dropdown",
	"css!./bootstrapv4/bootstrap.css",
	// "css!./senseui-dropdown.css",
], function(qlik, $, qvangular, _, Theme) {
'use strict';

	Theme = JSON.parse(Theme);

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
								popupWidth: {
									type: "string",
									expression: "none",
									label: "Popup Width",
									defaultValue: 100,
									ref: "vars.popupWidth"
								},
								borderRadius: {
									type: "string",
									label: "Border Radius",
									ref: "vars.borderRadius",
									defaultValue: 4
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
	me.paint = function ($element, layout) {
		// Set height of the drop down
		var vars = {
			v: '1.4.1',
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
			popupWidth: (layout.vars.popupWidth)?layout.vars.popupWidth: 100,
			borderRadius: (layout.vars.borderRadius) ? layout.vars.borderRadius : 4,
		}
			
		vars.data = vars.data.map((d) => {
			return {
				"dimension":d[0].qText,
				"measure": (d[1].qText) ? d[1].qText : null,
				"measureNum": (d[1].qNum) ? d[1].qNum : null,
				"qElemNumber":d[0].qElemNumber,
				"qState":d[0].qState,
			}
		});

		//Get Selection Bar
		me.app.getList("SelectionObject", (reply) => {
			var selectedFields = reply.qSelectionObject.qSelections;
			var selected = _.where(selectedFields, {'qField': vars.field});
			if (selected.length) {
				var selectedInfo = selected[0].qSelectedFieldSelectionInfo;
				for (i = 0; i < selectedInfo.length; i++) { 
					layout.vars.selected = selectedInfo[i].qName;
					// $('#${vars.id}_senseui_dropdown button').html(selectedInfo[i].qName + ' <span class="caret"></span>')
					// $( '#${vars.id}_filter a:contains("' + selectedInfo[i].qName + '")' ).css( "color", vars.row.textHoverColor );
					// $( '#${vars.id}_filter a:contains("' + selectedInfo[i].qName + '")' ).css( "background-color", vars.row.backgroundHoverColor );
					// $( '#${vars.id}_filter a:contains("' + selectedInfo[i].qName + '")' ).unbind('mouseenter mouseleave');
				}
			} else {
				layout.vars.selected = null;
			}
		});

		for (var i=0; i < vars.data.length; i++) {
			if (vars.data[i].qState=='S') {
				vars.btnLabel = vars.data[i].dimension;
			}
		}

		vars.template = `
			<div qv-extension class="senseui-dropdown" id="${vars.id}_senseui_dropdown">
				<div class="dropdown">
					<button class="btn btn-default dropdown-toggle" type="button" id="${vars.id}_dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
						${vars.btnLabel}
					</button>
					<ul class="dropdown-menu scrollable-menu" aria-labelledby="dropdownMenu1">
		`;
		for (var i=0; i < vars.data.length; i++) {
			var cssClass = (vars.data[i].qState=='S')?'active':'';
			vars.template += `<li class="${cssClass}"><a data-qElemNumber="${vars.data[i].qElemNumber}">${vars.data[i].dimension}</a></li>`; 
		}
		vars.template += `
					</ul>
				</div>
			</div>
		`;

		// CSS

		// Button Colors
		vars.btnBgColor = (layout.btnBgColorHex !== '') ? layout.btnBgColorHex : Theme.palette[layout.btnBgColor];
		vars.btnTxtColor = (layout.btnTxtColorHex !== '') ? layout.btnTxtColorHex : Theme.palette[layout.btnTxtColor];

		vars.css = `
			#${vars.id}_senseui_dropdown #SenseUI-DropDown {
				height: 100%;
				position: relative;
				overflow: auto;
			}
			#${vars.id}_senseui_dropdown #dropdownP {
			  padding: 5px;
			}
			#${vars.id}_senseui_dropdown .scrollable-menu {
			    height: auto;
			    overflow-x: hidden;
			    z-index: 9999999 !important;
			}
			#${vars.id}_senseui_dropdown .qv-object-senseui-dropdown {
				overflow: visible !important;
			}
			#${vars.id}_senseui_dropdown .btn-default.dropdown-toggle {
			  white-space: nowrap;
			  overflow: hidden;
			  text-overflow:
			}
			#${vars.id}_senseui_dropdown li.active a {
				color: ${vars.row.textHoverColor};
			}
			#${vars.id}_senseui_dropdown li {
				padding-left:10px;
				padding-right:10px;
				cursor: pointer;
			}
			#${vars.id}_senseui_dropdown li a:hover,
			#${vars.id}_senseui_dropdown li:hover,
			#${vars.id}_senseui_dropdown li.active {
				color: ${vars.row.textHoverColor};
				background-color: ${vars.row.backgroundHoverColor}
			}
			#${vars.id}_senseui_dropdown li.deactive {
				background-color: ${vars.row.backgroundDeactiveColor};
			}
			#${vars.id}_senseui_dropdown .dropdown-menu,
			#${vars.id}_senseui_dropdown .btn-default {
				border-radius: ${vars.borderRadius}px;
				width: ${vars.popupWidth+30}px;
				text-align: left;
			}
			#${vars.id}_senseui_dropdown .btn-default .caret {
				margin-top: 10px;
			}
			#${vars.id}_senseui_dropdown .btn-default {
				color: ${vars.btnTxtColor}px;
				background-color: ${vars.btnBgColor}x;
			}
			#${vars.id}_senseui_dropdown .scrollable-menu {
				max-height: ${vars.popupHeight}px;
				min-width: ${vars.popupWidth}px;
			}
		`;

		//hack to show the popup on top of the container, including on a mashup for the API
		$( `div[tid="${vars.id}"] article, #${vars.id} article` ).css( "overflow", 'visible' );

		$("<style>").html(vars.css).appendTo("head");
		$element.html(vars.template);

		$( `#${vars.id}_senseui_dropdown a` ).click(function(e) {
			var qElemNumber = parseInt(this.getAttribute('data-qElemNumber'));
			vars.this.backendApi.selectValues(0, [qElemNumber], vars.multipleSelections);
		});
		
		// This will allow the popup on top of other elements
		$('[tid=NckfKv] .qv-object .qv-inner-object').css("overflow","visible")
		console.log( qvangular );
		$( document ).ready(function() {
			console.log( "ready!" );
		});
		window.addEventListener("load",function() {
			console.log(333)
		})
		console.info(`%c SenseUI-DropDown ${vars.v}: `, 'color: red', `#${vars.id} Loaded!`);
	};

	// define HTML template	
	// me.template = ``;

	// The Angular Controller for binding
	me.controller = ["$scope", "$rootScope", "$element", "$timeout", function ( $scope, $rootScope, $element, $timeout ) {
		console.log(222)
		console.log($rootScope)
		$scope.$on('$viewContentLoaded', function(){
			console.log( "ready222!" );
		});
		$rootScope.$on('$includeContentLoaded', function() {
			console.log( "ready4444!" );
		});
		$timeout(function(){
			console.log( "ready5555!" );
		}, 0);
	}]

	return me;
});
