CKEDITOR.plugins.add('cogen_outputlabel', {
    icons: 'outputlabel',
    init: function(editor) {
        editor.addCommand('replaceWithOutputLabel', {
            exec: function(editor) {
                var
                    selected = editor.getSelection().getSelectedText(),
                    $selectedElement = $(editor.getSelection().getStartElement().$)
                ;

                if (selected !== '') {
                    if($selectedElement.hasClass('output-label')) {
                        var replacement = new CKEDITOR.dom.element('p');
                        replacement.setText(selected);
                        editor.insertElement(replacement);
                    }
                    else {
                        var replacement = new CKEDITOR.dom.element('p');
                        replacement.setAttributes({class: 'output-label'});
                        replacement.setText(selected);
                        editor.insertElement(replacement);
                    }
                }
            }
        });

        editor.ui.addButton('Outputlabel', {
            label: 'Create Output Label',
            command: 'replaceWithOutputLabel',
            toolbar: 'others,0'
        });
    }
});