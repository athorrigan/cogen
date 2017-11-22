CKEDITOR.plugins.add('cogen_addnote', {
    icons: 'note',
    init: function(editor) {
        editor.addCommand('replaceWithNote', {
            exec: function(editor) {
                var selected = editor.getSelection().getSelectedText();
                var replacement = new CKEDITOR.dom.element('div');
                replacement.setAttributes({class: 'note'});
                replacement.setText(selected);
                editor.insertElement(replacement);
            }
        });

        editor.ui.addButton('Note', {
            label: 'Create Note Section',
            command: 'replaceWithNote',
            toolbar: 'notations'
        });
    }
});