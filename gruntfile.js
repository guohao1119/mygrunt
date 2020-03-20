// grunt 入口文件
// 用于定义一些需要Grunt自动执行的任务
// 需要导出一个函数
// 该函数接收一个grunt的形参，内部提供一些api

// 引入grunt-sass需要用到的sass
const sass = require('sass')
const loadGruntTasks = require('load-grunt-tasks')

module.exports = grunt => {
  // 可以通过yarn grunt foo来执行该任务
  grunt.registerTask('foo', () => {
    console.log('foo')
  })

  // 通过yarn grunt --help查看帮助信息，会出现在available tasks中，任务描述会在任务名后显示
  grunt.registerTask('bar', '任务描述', () => {
    console.log('bar')
  })

  // 如果任务名称指定为default，那么执行任务时不指定名称，会自动执行default的任务
  // grunt.registerTask('default', () => {
  //   console.log('default')
  // })

  // 在默认任务的第二个参数中传入一个方数组，数组中是任务名称，则会依次执行这些任务
  // grunt.registerTask('default', ['foo', 'bar'])

  // 对异步操作的支持
  grunt.registerTask('async-task', function() { // 由于使用到this，所以这里不能使用回调函数
    const done = this.async() // 必须拿到这个回调函数
    setTimeout(() => {
      console.log('模拟异步执行中')
      done() // 异步任务执行完成后执行done，grunt才知道异步任务已完成
    }, 2000)
  })

  // 如果需要标记任务执行失败，使用return false，如果该任务处于一个任务列表中，则后续任务不再执行
  // 如果需要即使失败也继续执行，则需要加上--force
  // yarn grunt default --force
  grunt.registerTask('bad', () => {
    console.log('error')
    return false
  })

  // foo和bad会执行，bar不会执行
  // grunt.registerTask('default', ['foo', 'bad', 'bar'])


  // 如果需要标记异步任务执行失败，则只需要在执行完毕的回调函数中传入false参数即可
  grunt.registerTask('async-bad', function(){
    const done = this.async()
    setTimeout(() => {
      console.log('async done')
      done(false)
    }, 1000)
  })

  // grunt的配置
  // 通过initConfig方法进行配置设置
  // grunt.initConfig({
  //   foo: '123', // 值可以是任意类型的
  //   bar: {
  //     a: 111
  //   }
  // })

  // 在任务中使用grunt.config('xxx')拿到配置
  grunt.registerTask('config', () => {
    console.log(grunt.config('foo'))
    console.log(grunt.config('bar'))
  })

  // 多目标任务：可以让任务根据配置形成多个子任务
  // 需要进行配置以生成多目标
  // grunt.initConfig({
  //   build: {
  //     options: { // 如果是options，则是当前任务的配置，而不是子任务
  //       buildOptions: 1
  //     },
  //     taska: { // 不是options，是子任务
  //       options: { // 子任务的配置，会覆盖父任务的配置
  //         // buildOptions: 2,
  //         taskaOptions: 2
  //       }
  //     },
  //     taskb: 2
  //   }
  // })
  // 定义多目标任务，需要使用registerMultiTask
  // 执行任务时 yarn grunt build
  // 如果只执行某个子任务： yarn grunt build:taska
  grunt.registerMultiTask('build', function () { // 这里由于要使用this，不能使用箭头函数
    // 调用options方法获取当前任务的配置选项
    console.log(this.options())
    // 通过target拿到当前任务的名称，data拿到数据
    console.log(`target: ${this.target}, data: ${this.data}`)
  })

  // 插件的使用
  // npm安装插件包
  // 加载插件中提供的任务
  // 配置相关选项
  // 1 安装grunt-contrib-clean依赖包
  // 2 如果在加载了该插件之后就执行，yarn grunt clean，则会报错target未找到，说明需要进行配置
  // grunt.initConfig({
  //   clean: {
  //     // temp: 'temp/test.js' // 会找到temp下的test.js文件并删除
  //     // temp: 'temp/*.txt' // *通配符 会找到temp下的所有txt文件并删除
  //     temp: 'temp/**' // **通配符 会找到temp的所有文件夹及文件并删除，包括temp文件夹自身
  //   }
  // })
  // grunt.loadNpmTasks('grunt-contrib-clean')


  // 常用插件
  // grunt-sass、grunt-babel、grunt-contrib-watch

  // grunt-sass
  // 1 安装grunt-sass sass依赖
  // 2 loadNpmTasks加载插件
  // 3 添加相关配置 要在main下面的files中配置输入输出的文件路径
  // 4 执行任务
  // 会发现报错：必须要配置implementation选项
  // 5 引入sass模块
  // 6 配置implementation

  // grunt-babel
  // 1 安装依赖grunt-babel @babel/core @babel/preset-env
  // 2 为了避免使用太多loadNpmTasks，可以使用load-grunt-tasks进行管理，安装load-grunt-tasks
  // 3 引入load-grunt-tasks并调用
  // 4 配置babel的相关选项

  // grunt-contrib-watch
  // 用于监听文件变化后执行一些任务
  // 1 安装依赖grunt-contrib-watch
  // 2 配置相关选项
  // 3 由于watch只会在文件变化后才执行，所以需要在初始情况下执行一遍对应的任务
  //   所以需要配置default，设置任务队列，将watch放在最后
  // 4 运行时执行yarn grunt

  grunt.initConfig({
    sass: {
      options: {
        // 其他配置项查看官方文档
        sourceMap: true, // 生成map文件
        implementation: sass
      },
      main: {
        files: {
          // 目标文件路径: 源文件路径
          'dist/css/main.css': 'sass/main.scss'
        }
      }
    },
    babel: {
      options: {
        sourceMap: true,
        // 配置babel预设的针对ECMAScript的转换规则
        presets: ['@babel/preset-env']
      },
      main: {
        files: {
          // 如果这里配置的路径找不到，会报错 Warning: The "path" argument must be of type string
          // 如果转义的js中有错误，也会报出来
          'dist/js/main.js': 'js/main.js'
        }
      }
    },
    watch: {
      js: {
        // 要监视的文件，通过数组和通配符的形式支持多个
        files: ['js/*.js'],
        // 要执行的任务也可以配置多个
        tasks: ['babel']
      },
      css: {
        files: ['sass/*.scss'],
        tasks: ['sass']
      }
    }
  })
  // grunt.loadNpmTasks('grunt-sass')
  loadGruntTasks(grunt) // 调用loadGruntTasks，将grunt传进来，就会自动加载使用到的插件

  // 为了初始时执行相关任务，在这里进行一次配置，最后执行watch，以便文件变化后执行对应任务
  grunt.registerTask('default', ['babel', 'sass', 'watch'])
}