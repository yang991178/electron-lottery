// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const $ = require('jquery')
const Vue = require('./assets/js/vue.js')
require('popper.js')
require('./assets/js/bootstrap.min.js')
const {ipcRenderer: ipc} = require('electron')

var list = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99"]

class Lottery {
    constructor(name, size, time = 175) {
        this.name = name
        this.size = size
        this.time = time
        this.init()
    }

    init() {
        this.temp = []
        this.result = []
        this.display = []
        this.state = 0 // 0 = not started, 1 = ongoing, 2 = finished
    }

    randomize() {
        if (this.state == 0) {
            this.state = 1
            this.temp = list.slice(0)
            this.shuffle()
        }
    }
    
    displayText() {
        var i = 0
        var result = []
        while(i < this.size) {
            var a = this.temp.slice(i, i + Math.min(5, this.size - result.length))
            result.push(a.join("、"))
            i += a.length
        }
        return result
    }

    roll() {
        if (this.state == 1) {
            this.temp = this.temp.splice(-this.size-5, this.size+5).concat(this.temp)
            this.display.splice(0)
            this.display = this.display.concat(this.displayText())
            var that = this
            setTimeout(function(){that.roll()}, this.time)
        }
    }

    stop() {
        if (this.state == 1) {
            this.state = 2
            this.display = this.displayText()
            this.result = this.temp.slice(0, this.size)
            for (var n in this.result) {
                var i = list.indexOf(this.temp[n])
                if (i != -1) list.splice(i, 1)
            }
            console.log(this.result)
        }
    }

    shuffle() {
        var temp = this.temp
        var currentIndex = temp.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = temp[currentIndex];
          temp[currentIndex] = temp[randomIndex];
          temp[randomIndex] = temporaryValue;
        }

        this.roll()
    }

    refresh() {
        list = list.concat(this.result)
        this.init()
    }
}

var app = new Vue({
    el: '#app',
    data: {
        isFullScreen: false,
        lotteries: [new Lottery("三等奖", 20), new Lottery("二等奖", 10), new Lottery("一等奖", 4, 100)],
        current: null,
        index: 0
    },
    created: function() {
        this.current = this.lotteries[this.index]
    },
    methods: {
        start: function() {
            if (this.current) {
                if (this.current.state == 0)
                    this.current.randomize()
                else if (this.current.state == 1)
                    this.current.stop()
            }
        },
        select: function(i) {
            if (this.current.state != 1) {
                this.index = i
                this.current = this.lotteries[i]
            }
        },
        refresh: function() {
            this.current.refresh()
        },
        ipcSend: function(message) {
            ipc.send(message)
        },
        fullScreen: function() {
            this.isFullScreen = !this.isFullScreen
            this.ipcSend('maximize')
        }
    }
  })