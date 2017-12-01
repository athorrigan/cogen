CKEDITOR.plugins.add('cogen_lightbox', {
    icons: 'lightbox',
    init: function(editor) {
        editor.addCommand('replaceWithLightbox', {
            exec: function(editor) {
                var
                    $selectedElement = $(editor.getSelection().getStartElement().$),
                    tagName = $selectedElement.prop('tagName'),
                    parentTagName = $selectedElement.parent().prop('tagName')
                ;

                if (tagName === 'IMG') {
                    if (parentTagName === 'P') {
                        var replacement = new CKEDITOR.dom.element('a');
                        replacement.setAttributes({
                            class: 'fancy-image',
                            href: $selectedElement.prop('src')
                        });
                        replacement.$.appendChild($selectedElement[0]);
                        editor.insertElement(replacement);
                    }
                    else if (parentTagName === 'A') {
                        $selectedElement.parent().remove();
                        var newImg = new CKEDITOR.dom.element('img');
                        newImg.setAttributes({
                            src: $selectedElement.prop('src')
                        });
                        
                        editor.insertElement(newImg);
                    }
                }
            }
        });

        editor.ui.addButton('Lightbox', {
            label: 'Create Lightbox for Image',
            command: 'replaceWithLightbox',
            toolbar: 'others,1'
        });
    }
});