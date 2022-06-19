<script lang="ts">
import { defineComponent } from "vue";
const Net = require("net")
const fs = require("fs");
const { ipcRenderer } = require("electron")
import UserCard from "./components/UserCard.vue"
import ChannelCard from "./components/ChannelCard.vue"
import ServerCard from "./components/ServerCard.vue"
import MessageCard from "./components/MessageCard.vue"
import Switch from "./components/Switch.vue"
import Dropdown from "./components/Dropdown.vue"
import { Interface } from "readline";
import { parse } from "node:path/win32";
const Store = require("electron-store")

function html(object: any) {
  return object as HTMLElement
}

function input(object: any) {
  return object as HTMLInputElement
}

function dropdown(object: any) {
  return object as typeof Dropdown
}

class User {

  name: string  = "";
  imageUrl: string  = "";
  status: string = "";
  id: string  = "";

  constructor (name: string, imageUrl: string, status: string, id: string){
    this.name = name;
    this.imageUrl = imageUrl;
    this.status = status;
    this.id = id;
  }
}

class Server {
  name: string = "";
  imageUrl: string = "";
  url: string = "";
  port: number = 3000

  constructor(name: string, imageUrl: string, url: string, port: number)
  {
    this.name = name;
    this.imageUrl = imageUrl;
    this.url = url;
    this.port = port;
  }
}

class Channel {

  name: string = "";
  type: string = "";
  port: number = 0;

  constructor (name: string, type: string, port: number){
    this.name = name;
    this.type = type;
    this.port = port;
  }
}

class Message {
  user: User  = new User("", "", "", "");
  message: string = "";
  time: string = "";

  constructor(user: User, message: string, time: string) {
    this.user = user;
    this.message = message;
    this.time = time;
  }
}

class ColorScheme {
  name = "new color scheme"
  primary = "rgb(0, 0, 0)"
  secondary = "rgb(0, 0, 0)"
  third = "rgb(0, 0, 0)"
  text = "rgb(0, 0, 0)"

  constructor (name: string, primary: string, secondary: string, third: string, text: string) {
    this.name = name
    this.primary = primary
    this.secondary = secondary
    this.third = third
    this.text = text
  }
}

function getTimeStr() {
  const now = new Date();
  let seconds = now.getSeconds().toString().length == 1 ? "0" + now.getSeconds() : now.getSeconds();
  let minutes = now.getMinutes().toString().length == 1 ? "0" + now.getMinutes() : now.getMinutes();
  let hours = now.getHours().toString().length == 1 ? "0" + now.getHours() : now.getHours();
  return `${hours}:${minutes}:${seconds}`
}

function rjcu(filename: string, elseUse: any, element: string): any{
  fs.exists(filename, (err: any) => {
    if (err){
      console.log(JSON.parse(fs.readFileSync(filename)))
      return JSON.parse(fs.readFileSync(filename))[element]
    }
    else {
        fs.writeFile(filename, '', () => {})
        return elseUse[element]
    }
  })
  return elseUse[element]
}

let serverConnection: typeof Net.Socket;
let channelConnection: typeof Net.Socket;

const store = new Store()

let App = defineComponent({
  mounted() {
    this.$nextTick(() => {
      this.servers = store.get('servers') || [] as Server[]
      this.colorSchemes = JSON.parse(fs.readFileSync('./colors.json')).schemes
      this.colorSchemeIndex = this.colorSchemeIndex >= this.colorSchemes.length ? 0 : this.colorSchemeIndex
      this.primary = this.colorSchemes[this.colorSchemeIndex].primary
      this.secondary = this.colorSchemes[this.colorSchemeIndex].secondary
      this.third = this.colorSchemes[this.colorSchemeIndex].third
      this.text = this.colorSchemes[this.colorSchemeIndex].text
      if (!store.get('platform')) store.set('platform', process.platform)
      this.platform =  store.get('platform')
      this.darkmode = store.get('darkmode') as boolean
      if (store.get('connectedServer') != null)
      this.connectIdx(store.get('connectedServer'), store.get('connectedChannel'))
    })
  },
  data() {
    return {
      window: window,
      localUser: new User("NaN", "https://i.imgur.com/AtjuEkK.png", "NaN", "0"),
      title: "Jabsy",
      colorSchemes: [ new ColorScheme('Dark', 'rgb(31, 41, 55)', 'rgb(55, 65, 81)', 'rgb(17, 24, 39)', '#fff'), new ColorScheme('Light', 'rgb(209 213 219)', 'rgb(229 231 235)', '#fff', '#000') ],
      colorSchemeIndex: store.get('colorScheme') || 0,
      users: [] as User[],
      channels: [] as Channel[],
      servers: [] as Server[],
      messages: [ ] as Message[],
      messageTitle: "Title",
      messageContent: "And some Content, of course",
      messageOpacity: 0,
      serverName: 'Server',
      channelName: 'Channel',
      platform: '',
      darkmode: true,
      showSettings: false,
      showServerUI: false,
      primary: '',
      secondary: '',
      third: '',
      text: '',
    }
  },
  methods: {
    html,
    input,
    dropdown,
    close() {
      if (channelConnection) channelConnection.destroy()
      if (serverConnection) serverConnection.destroy()
      ipcRenderer.send('close');
    },
    maximize() {
      ipcRenderer.send('maximize');
    },
    minimize() {
      ipcRenderer.send('minimize');
    },
    toggleDarkMode(){
      this.changeColorScheme(this.colorSchemeIndex == 0 ? 1 : 0)
    },
    envget(name: string) {
      return store.get(name)
    },
    changeColorScheme(n: number) {
      this.colorSchemeIndex = n
      this.primary = this.colorSchemes[this.colorSchemeIndex].primary
      this.secondary = this.colorSchemes[this.colorSchemeIndex].secondary
      this.third = this.colorSchemes[this.colorSchemeIndex].third
      this.text = this.colorSchemes[this.colorSchemeIndex].text
      store.set('colorScheme', n)
    },
    windowStyleChanged(style: string) {
      console.log(style)
      switch (style) {
        case 'Default':
          this.platform = process.platform
          break
        case 'MacOS':
          this.platform = 'darwin'
          break
        case 'Windows':
          this.platform = 'win32'
          break
      }
      store.set('platform', this.platform)
    },
    getPlatformName() {
      switch(this.platform) {
        case 'darwin':
          return 'MacOS'
        case process.platform:
          return 'Default'
        default:
          return 'Windows'
      }
    },
    addServer(server: object) {
      this.servers.push(this.asServer(server))
      store.set('servers', this.servers)
    },
    asServer(obj: any) {
      return new Server(obj.name, obj.imageURL, obj.url, obj.port)
    },
    connectIdx(index: number, channel: number) {
      store.set('connectedServer', index)
      this.connect(this.servers[index].url, this.servers[index].port, channel)
    },
    connect(URL: string, port: number, channel: number) {
      if(serverConnection && serverConnection.address().address != URL || !serverConnection){
        if (channelConnection) channelConnection.destroy()
        if (serverConnection) serverConnection.destroy()
        serverConnection = new Net.Socket();
        serverConnection.connect(port, URL, () => {
          console.log("connected")
        });
        serverConnection.write(JSON.stringify(this.localUser))
        console.log(JSON.stringify(this.localUser))
        serverConnection.on('data', (data: Buffer) => {
          const json = JSON.parse(data.toString())
          this.users = [] as User[];
          json.users.forEach((element: User) => {
            this.users.push(new User(element.name, element.imageUrl, element.status, element.id))
          });
          this.serverName = json.name;
          this.channels = json.channels
          this.setChannel(channel)
        })
      }
    },
    setChannel(n: number){
      const timeOut = 10000


      store.set('connectedChannel', n)
      if (channelConnection) channelConnection.destroy()
      channelConnection = new Net.Socket();
      channelConnection.connect(this.channels[n].port, serverConnection.address().address, () => {
        console.log(`connected to channel at ${serverConnection.address().address}:${this.channels[n].port}`)
        this.channelName = this.channels[n].name
      })
      channelConnection.on("data", (data: Buffer | String) => {
        console.log(data.toString())
        if (this.channels[n].type === 'chat') {
          const json = JSON.parse(data.toString())
          if(json.messages)
          {
            this.messages = json.messages;
            return;
          }
          this.messages.push(new Message(json.user, json.message, json.time));
        }
      })
    },
    sendMessage(message: string) {
      if(message.startsWith("!id ")) { this.localUser.id = message.substring(4, message.length); this.connectIdx(store.get('connectedServer'), store.get('connectedChannel')) }
      else if (message.startsWith("!name ")) { this.localUser.name = message.substring(6, message.length); this.connectIdx(store.get('connectedServer'), store.get('connectedChannel')) }
      else if (message.startsWith("!status ")) { this.localUser.status = message.substring(8, message.length); this.connectIdx(store.get('connectedServer'), store.get('connectedChannel')) }
      else if (channelConnection)
      {
        let data = JSON.stringify({
          user: this.localUser,
          message: message,
          time: getTimeStr()
        })
        channelConnection.write(data)
      }
      else this.notify('Not Connected', 'You aren\'t connected to any server!', 6000)
    },
    notify(title: string, content: string, time: number) {
      this.messageTitle = title;
      this.messageContent = content;
      this.messageOpacity = 1;
      setTimeout(() => {this.messageOpacity = 0}, time)
    },
    debug() {
    },
    reset() {
      store.set('x', -1)
      store.set('y', -1)
      store.set('width', -1)
      store.set('height', -1)
      store.set('maximized', false)
      ipcRenderer.send('restart')
    }
  },
  components: {
    UserCard,
    ChannelCard,
    ServerCard,
    MessageCard,
    Switch,
    Dropdown,
  },
  updated() {
    const chatMessageContainer = (this.$refs.chatMessageContainer as HTMLElement)
    chatMessageContainer.scrollTo(0, chatMessageContainer.scrollHeight)
  }
});

export default App;
</script>

<template>
<div class="w-screen h-screen bg-third" :style="{'--primary': primary, '--secondary': secondary, '--third': third, '--text': text, color: 'var(--text)'}">
<div class="absolute top-0 left-0 right-0 h-5 z-10 drag flex flex-row">
<div class="w-full grid justify-start items-center">
  <div v-if="platform == 'darwin'" class="text-sm h-full mt-1">
  <a @click="close()" class="relative m-1 cursor-pointer no-drag text-red-500"><faIcon icon="circle" /></a>
  <a @click="maximize()" class="relative m-1 cursor-pointer no-drag text-yellow-500"><faIcon icon="circle" /></a>
  <a @click="minimize()" class="relative m-1 cursor-pointer no-drag text-green-500"><faIcon icon="circle" /></a>
  </div>
</div>
<div class="w-full grid place-items-center">
  <span class="ml-2">{{ title }}</span>
</div>
<div class="w-full flex justify-end items-center">
  <div v-if="platform != 'darwin'">
  <a @click="close()" class="float-right mx-1 cursor-pointer no-drag"><faIcon icon="times"></faIcon></a>
  <a @click="maximize()" class="float-right mx-1 cursor-pointer no-drag"><faIcon icon="plus"></faIcon></a>
  <a @click="minimize()" class="float-right mx-1 cursor-pointer no-drag"><faIcon icon="minus"></faIcon></a>
  </div>
</div>
</div>
<div ref="channels" class="absolute w-60 bottom-2 left-2 top-6 bg-secondary rounded-lg z-0">
  <ChannelCard v-for="(channel, i) in channels" @click="setChannel(i)" :name="channel.name" :type="channel.type" />
</div>
<div ref="servers" class="absolute flex flex-row h-20 top-6 left-64 right-2 bg-secondary rounded-lg z-0">
  <ServerCard v-for="(server, i) in servers" @click="connectIdx(i, 0)" :name="server.name" :url="server.url" :imageUrl="server.imageUrl"/>
  <div @click="showServerUI = true" class="m-2 bg-primary h-16 w-16 rounded-[2rem] hover:rounded-2xl transition-all duration-500 overflow-hidden cursor-pointer grid place-content-center">
    <faIcon icon="plus" class="text-3xl" />
  </div>
</div>
<div ref="chat" class="absolute left-64 bottom-2 top-[7rem] right-64 bg-secondary rounded-lg z-0">
  <div class="absolute top-0 h-6 left-0 right-0 px-2">{{ serverName }} <faIcon icon="arrow-right"></faIcon> {{ channelName }}</div>
  <div ref="chatMessageContainer" class="absolute top-6 right-0 left-0 bottom-14 p-2 overflow-scroll overflow-x-hidden">
    <MessageCard v-for="message in messages" :message="message"/>
  </div>
  <div class="absolute bottom-0 right-0 left-0 h-14">
    <input ref="chatInput" @keyup.enter="sendMessage(input($refs.chatInput).value); input($refs.chatInput).value = ''" type="text" class="w-[calc(100%-1rem)] h-10 m-2 bg-primary rounded-3xl transition-[border-radius] duration-300 focus:rounded-lg px-1">
  </div>
</div>
<div ref="users" class="absolute w-60 bottom-24 right-2 top-[7rem] bg-secondary rounded-lg z-0">
  <UserCard v-for="user in users" :name="user.name" :imageUrl="user.imageUrl" :status="user.status" />
</div>
<div ref="localUser" class="absolute w-60 h-20 bottom-2 right-2 bg-secondary rounded-lg z-0">
  <img class="absolute left-1 top-1 bottom-1 aspect-square rounded-full w-[4.5rem]" :src="localUser.imageUrl">
  <span class="absolute block overflow-hidden h-7 w-25 left-20 right-14 text-xl top-4 text-ellipsis whitespace-nowrap">{{ localUser.name }}</span>
  <span class="absolute block overflow-hidden h-6 w-25 left-20 right-14 top-10 text-base text-ellipsis whitespace-nowrap">{{ localUser.status }}</span>
  <a @click="showSettings = true" class="absolute cursor-pointer right-2 text-4xl top-5 w-10 h-10 grid place-items-center hover:animate-spin">
  <faIcon icon="gear"></faIcon>
  </a>
</div>
<div :style="{opacity: messageOpacity, 'pointer-events': messageOpacity == 1 ? 'all' : 'none', transition: 'opacity .5s ease-in-out'}" class="absolute top-8 p-2 w-64 bg-blue-500 rounded-lg left-[calc(50%-8rem)]">
  <h3 class="text-2xl">{{ messageTitle }}</h3>
  <span>{{ messageContent }}</span>
</div>
<Transition name="fade">
<div v-if="showServerUI" class="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(41,41,41,0.5)] grid place-items-center">
<div class="w-3/12 z-50 flex items-center flex-col bg-secondary rounded-3xl p-2">
<h1>Add Server</h1>
<input ref="serverUrlInput" class="h-7 w-10/12 my-4 text-black p-1 rounded-lg" placeholder="Server URL">
<input ref="serverPortInput" class="h-7 w-10/12 my-4 text-black p-1 rounded-lg" placeholder="Port">
<button @click="addServer({name: 'NaN', imageURL: 'https://i.imgur.com/AtjuEkK.png', url: input($refs.serverUrlInput).value, port: input($refs.serverPortInput).value}); showServerUI = false;" class="group w-8/12 relative bg-primary items-center grid place-items-center rounded-lg my-2 p-2 hover:bg-blue-600  duration-500"><span class="beautiful-underline group-hover:text-white">Add Server</span></button>
<a @click="showServerUI = false" class="text-center border-b-2 cursor-pointer">Cancel</a>
</div>
</div>
</Transition>
<Transition name="fade">
  <div v-if="showSettings" ref="settings" class="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(41,41,41,0.5)] grid place-items-center">
    <a class="absolute top-10 right-10 text-3xl cursor-pointer" @click="showSettings = false"><faIcon icon="times" /></a>
    <a class="absolute top-10 left-10 w-10 h-10 grid place-items-center text-3xl cursor-pointer hover:animate-[spin_1s_ease-in-out_forwards]" @click="window.location.reload()"><faIcon icon="rotate-right" /></a>
    <div class="bg-secondary rounded-3xl h-[90%] w-[50%] flex flex-col items-center">
      <h1>
        Settings
      </h1>
      <div class="w-8/12 h-12 relative bg-primary flex flex-row items-center rounded-lg my-2">
      <Dropdown ref="colorSchemeDropdown" :default="colorSchemes.map(a => a.name)[envget('colorScheme')]" :options="colorSchemes.map(a => a.name)" @selection-changed="changeColorScheme(dropdown($refs.colorSchemeDropdown).getSelectedIndex())" />
      <span class="absolute right-2">Color Scheme</span>
      </div>
      <div class="w-8/12 h-12 relative bg-primary flex flex-row items-center rounded-lg my-2">
      <Dropdown ref="windowStyleDropdown" :default="getPlatformName()" :options="['Default', 'Windows', 'MacOS']" @selection-changed="windowStyleChanged(dropdown($refs.windowStyleDropdown).getSelectedItem())" />
      <span class="absolute right-2">Window Style</span>
      </div>
      <button @click="reset()" class="group w-8/12 relative bg-primary items-center grid place-items-center rounded-lg my-2 p-2 hover:bg-blue-600  duration-500"><span class="beautiful-underline group-hover:text-white">Reset Window</span></button>
      <a @click="debug()">Debug</a>
    </div>
  </div>
</Transition>

</div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.beautiful-underline::after {
    display: block;
    content: "";
    border-bottom: 3px solid #fff;
  width:0;
    transition: all 0.5s ease;
}

.group:hover .beautiful-underline:after {
    width: 100%;
}
</style>
