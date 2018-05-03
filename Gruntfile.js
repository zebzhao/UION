
module.exports = function(grunt) {

  grunt.initConfig({
    webfont: {
      icons: {
        src: 'fonts/svg/*.svg',
        dest: 'less/lumi',
        destLess: 'less/lumi',
        options: {
          font: 'lumi-icons',
          syntax: 'bootstrap',
          stylesheets: ['less'],
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