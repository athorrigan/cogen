CKEDITOR.plugins.add('cogen_addimportant', {
    icons: 'important',
    init: function(editor) {
        editor.addCommand('replaceWithImportant', {
            exec: function(editor) {
                var
                    selected = editor.getSelection().getSelectedText(),
                    $selectedElement = $(editor.getSelection().getStartElement().$)
                ;

                if($selectedElement.hasClass('important-note')) {
                    $selectedElement.removeClass('important-note');
                }
                else {
                    var replacement = new CKEDITOR.dom.element('div');
                    replacement.setAttributes({class: 'important-note'});
                    replacement.setText(selected);
                    editor.insertElement(replacement);
                }
            }
        });

        editor.ui.addButton('Important', {
            label: 'Create Important Section',
            command: 'replaceWithImportant',
            toolbar: 'notations'
        });
    }
});