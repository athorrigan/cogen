CKEDITOR.plugins.add('cogen_addwarning', {
    icons: 'warning',
    init: function(editor) {
        editor.addCommand('replaceWithWarning', {
            exec: function(editor) {
                var selected = editor.getSelection().getSelectedText();
                var replacement = new CKEDITOR.dom.element('div');
                replacement.setAttributes({class: 'warning-note'});
                replacement.setText(selected);
                editor.insertElement(replacement);
            }
        });

        editor.ui.addButton('Warning', {
            label: 'Create Warning Section',
            command: 'replaceWithWarning',
            toolbar: 'notations'
        });
    }
});