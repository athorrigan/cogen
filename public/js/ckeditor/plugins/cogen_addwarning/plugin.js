CKEDITOR.plugins.add('cogen_addwarning', {
    icons: 'warning',
    init: function(editor) {
        editor.addCommand('replaceWithWarning', {
            exec: function(editor) {
                var
                    selected = editor.getSelection().getSelectedText(),
                    $selectedElement = $(editor.getSelection().getStartElement().$)
                ;

                if (selected !== '') {
                    if($selectedElement.hasClass('warning-note')) {
                        $selectedElement.removeClass('warning-note');
                    }
                    else if($selectedElement.hasClass('important-note')) {
                        $selectedElement.removeClass('important-note');
                        $selectedElement.addClass('warning-note');
                    }
                    else if($selectedElement.hasClass('note')) {
                        $selectedElement.removeClass('note');
                        $selectedElement.addClass('warning-note');
                    }
                    else {
                        var replacement = new CKEDITOR.dom.element('div');
                        replacement.setAttributes({class: 'warning-note'});
                        replacement.setText(selected);
                        editor.insertElement(replacement);
                    }
                }
            }
        });

        editor.ui.addButton('Warning', {
            label: 'Create Warning Section',
            command: 'replaceWithWarning',
            toolbar: 'notations'
        });
    }
});