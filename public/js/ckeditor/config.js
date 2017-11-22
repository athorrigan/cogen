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
		// { name: 'colors' },
		{ name: 'tools' },
		{ name: 'others' }
		// { name: 'about' }
	];

	config.extraPlugins = 'cogen_addwarning,cogen_addimportant,cogen_addnote,sourcedialog,toolbar,notification,notificationaggregator,filetools,uploadwidget,uploadimage,widgetselection,lineutils,widget,codesnippet,prism,clipboard,menu,contextmenu,dialog,dialogui,table,tabletools,panel,button,floatpanel,listblock,richcombo,format';

	// The default plugins included in the basic setup define some buttons that
	// are not needed in a basic editor. They are removed here.
	config.removeButtons = 'Indent,Outdent,Cut,Copy,Paste,Undo,Redo,Anchor,About';

	// Dialog windows are also simplified.
	config.removeDialogTabs = 'link:advanced';
};
