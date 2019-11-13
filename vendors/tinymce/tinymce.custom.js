/* globals tinymce */
// Custom initialization script for Tiny MCE
function tinymce_custom_init(options) {
    $(document).ready(function () {
        var opt = options ? options : {};
        if (!opt.selector)
            opt.mode = 'textareas';
        opt.menubar = false;
        opt.convert_urls = false;
        opt.paste_data_images = true;
        opt.plugins = ['code link paste'];
        opt.toolbar_items_size = 'small';
        opt.fontsize_formats = '14px 15px 16px 18px 20px 24px 28px 32px 40px';
        opt.toolbar = 'paste undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | link unlink | bullist numlist | outdent indent blockquote | fontsizeselect | code removeformat';
        opt.browser_spellcheck = true;
        opt.setup = function (editor) {
            this.on('init', function () {
                this.targetElm.required = false;
                $('#' + this.id + '_ifr').removeAttr('frameborder').removeAttr('allowtransparency');
            });
        };
        tinymce.init(opt);
    });
}
