export const Data = function () {
    return {
    }
}
export const Methods = {
    getActiveRange: function () {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        // Inspeccionamos dentro del Shadow DOM
        const ranges = selection.getComposedRanges({ shadowRoots: [this.root] });
        if (!ranges || ranges.length === 0) return null;
        const range = ranges[0];
        const editor = this.root.querySelector('.wysiwyg-editor');
        // Validamos que la selección realmente pertenezca al editor
        if (editor && editor.contains(range.startContainer)) {
            const realRange = document.createRange();
            realRange.setStart(range.startContainer, range.startOffset);
            realRange.setEnd(range.endContainer, range.endOffset);
            return realRange;
        }
        return null;
    },

    texttoBold: function (args, event) {
        this.textEditingTag("b", event);
    },
    texttoItalic: function (args, event) {
        this.textEditingTag("i", event);
    },
    texttoUnderline: function (args, event) {
        this.textEditingTag("u", event);
    },
    texttoStrikethrough: function (args, event) {
        this.textEditingTag("s", event);
    },
    colorMarker: function (args, event) {
        this.textEditingTag("span", event, { backgroundColor: "yellow" });
    },
    textEditingTag: function (tag, event, style = undefined) {
        if (event) event.preventDefault();
        const range = this.getActiveRange();
        if (range && !range.collapsed) {
            const editor = this.root.querySelector('.wysiwyg-editor');

            const applyStyle = (el) => {
                if (style !== undefined) {
                    if (typeof style === 'string') {
                        el.style.cssText = style;
                    } else if (typeof style === 'object' && style !== null) {
                        Object.assign(el.style, style);
                    }
                }
            };

            // 1. Buscamos si la selección ya está dentro de una etiqueta
            let uElement = null;
            let ancestor = range.commonAncestorContainer;
            if (ancestor.nodeType === Node.TEXT_NODE) {
                ancestor = ancestor.parentNode;
            }

            while (ancestor && ancestor !== editor) {
                if (ancestor.nodeName === tag.toUpperCase()) {
                    uElement = ancestor;
                    break;
                }
                ancestor = ancestor.parentNode;
            }
            if (uElement) {
                // 2. CASO QUITAR SUBRAYADO: Extraemos el contenido y lo colocamos como texto plano
                const beforeRange = document.createRange();
                beforeRange.setStart(uElement, 0);
                beforeRange.setEnd(range.startContainer, range.startOffset);

                const afterRange = document.createRange();
                afterRange.setStart(range.endContainer, range.endOffset);
                afterRange.setEnd(uElement, uElement.childNodes.length);

                const afterContent = afterRange.extractContents();
                const beforeContent = beforeRange.extractContents();

                const selectedContent = document.createDocumentFragment();
                while (uElement.firstChild) {
                    selectedContent.appendChild(uElement.firstChild);
                }

                const replacementFragment = document.createDocumentFragment();

                if (beforeContent.hasChildNodes()) {
                    const newU1 = document.createElement(tag);
                    applyStyle(newU1);
                    newU1.appendChild(beforeContent);
                    replacementFragment.appendChild(newU1);
                }

                const selectedNodes = Array.from(selectedContent.childNodes);
                replacementFragment.appendChild(selectedContent);

                if (afterContent.hasChildNodes()) {
                    const newU2 = document.createElement(tag);
                    applyStyle(newU2);
                    newU2.appendChild(afterContent);
                    replacementFragment.appendChild(newU2);
                }

                uElement.replaceWith(replacementFragment);

                // Seleccionamos el nuevo elemento para forzar el foco y mantener el resaltado
                if (selectedNodes.length > 0) {
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    const newRange = document.createRange();
                    newRange.setStartBefore(selectedNodes[0]);
                    newRange.setEndAfter(selectedNodes[selectedNodes.length - 1]);
                    selection.addRange(newRange);
                }
            } else {
                // 3. CASO APLICAR SUBRAYADO: Envolvemos en la etiqueta
                const fragment = range.cloneContents();

                // Limpiamos etiquetas del mismo tipo que estén anidadas dentro
                const nestedElements = fragment.querySelectorAll(tag);
                nestedElements.forEach(el => {
                    const parent = el.parentNode;
                    while (el.firstChild) {
                        parent.insertBefore(el.firstChild, el);
                    }
                    el.remove();
                });

                const underlineText = document.createElement(tag);
                applyStyle(underlineText);
                underlineText.appendChild(fragment);

                range.deleteContents();
                range.insertNode(underlineText);
                // Volvemos a seleccionar para mantener la experiencia de usuario
                const selection = window.getSelection();
                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(underlineText);
                selection.addRange(newRange);
            }
        }
    }
}