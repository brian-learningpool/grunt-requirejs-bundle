var AMDBundleProcesses = function (grunt, options){
    this.grunt = grunt;
    this.options = options;
},
path = require('path'),
Url = require('./Url'),
_ = require('lodash');

AMDBundleProcesses.prototype.isDirectory = function (path) {
    return this.grunt.file.isDir(path);
};
AMDBundleProcesses.prototype.enumerateInstalledPackages = function(path) {
    var grunt = this.grunt,
        options = this.options;
        
    return {
        path: path,
        packageNames: grunt.file.expand({
                                cwd: path, 
                                filter: 'isDirectory'
                            }, '*')
                            .filter(function hasManifest(dir) {
                                return grunt.file.exists(path, dir, options.manifestFile)
                            }) || []
    };       
};
AMDBundleProcesses.prototype.expandFullPackagePath = function (baseUrl) {
    var grunt = this.grunt,
        options = this.options;

    return function (target) {    
        var expandedPackagePaths = target.packageNames.map(function (packageName) {
                var manifestFilePath = path.join(target.path, packageName, options.manifestFile),
                    mainFile = getJavascriptMainFile(grunt.file.readJSON(manifestFilePath)),
                    packageUrl = new Url(target.path, packageName, mainFile);

                return packageUrl.makeRelative(baseUrl).href;
            });

        return {
            path: target.path,
            packageNames: expandedPackagePaths
        };
    };
};
AMDBundleProcesses.prototype.buildAMDModuleDefinition = function (accumulator, target) {
    var quotedNames  = target.packageNames.map(function (packageName) {
            return '"' + packageName + '"';
        });

    return accumulator + quotedNames.join(', ');
};

function getJavascriptMainFile(manifest) {
    manifest = _.extend({ main: 'index.js' }, manifest);
    return manifest.main.replace(/\.js$/, '');
}

module.exports = AMDBundleProcesses;