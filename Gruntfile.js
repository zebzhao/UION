
module.exports = function(grunt) {

  grunt.initConfig({
    webfont: {
      icons: {
        src: 'fonts/svg/*.svg',
        dest: 'fonts',
        destCss: 'css',
        options: {
          syntax: 'bem',
          embed: true,
          types: 'ttf,woff',
          templateOptions: {
            classPrefix: 'uk-icon-'
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-webfont');


  grunt.registerTask('default', ['webfont']);

};