/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For complete reference see:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config
    config.skin = 'moono';
    config.height = 500;
    // config.extraAllowedContent = 'img[alt,!src]';
    config.allowedContent = true;

    // Add additional stylesheets.
    config.contentsCss = ['/css/styles.css'];

	// The toolbar groups arrangement, optimized for a single toolbar row.
	config.toolbarGroups = [
		{ name: 'document',	   groups: [ 'Source', 'mode', 'document', 'doctools' ] },
		// { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
		// { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
		// { name: 'forms' },
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
		{ name: 'links' },
		{ name: 'insert' },
		{ name: 'styles' },
		{ name: 'notations' },
		{ name: 'colors' },
		{ name: 'tools' },
		{ name: 'others' }
		// { name: 'about' }
	];

	config.extraPlugins = 'font,colordialog,colorbutton,cogen_addwarning,cogen_addimportant,cogen_addnote,sourcedialog,toolbar,notification,notificationaggregator,filetools,uploadwidget,uploadimage,widgetselection,lineutils,widget,codesnippet,prism,clipboard,menu,contextmenu,dialog,dialogui,table,tabletools,panelbutton,panel,button,floatpanel,listblock,richcombo,format';

	// The default plugins included in the basic setup define some buttons that
	// are not needed in a basic editor. They are removed here.
	config.removeButtons = 'Indent,Outdent,Cut,Copy,Paste,Undo,Redo,Anchor,About';

	// Dialog windows are also simplified.
	config.removeDialogTabs = 'link:advanced';

	// Use Atlantic UI colors on color editor by default.
    config.colorButton_colors = '39393b,58585b,9e9ea2,ffffff,e8ebf1,049fd9,64bbe3,2b5592,005073,abc233,626469,7f7f86,b6b9bb,c6c7ca,dfdfdf,f2f2f2,64bbe3,14a792,6cc04a,ffcc00,ff7300,cf2030';
};
