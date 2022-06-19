import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faGear, faTimes, faPlus, faMinus, faComment, faVolumeHigh, faArrowRight, faTimesCircle, faPlusCircle, faMinusCircle, faCircle, faChevronDown, faRotateRight} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* add icons to the library */
library.add(faGear, faTimes, faPlus, faMinus, faComment, faVolumeHigh, faArrowRight, faTimesCircle, faPlusCircle, faMinusCircle, faCircle, faChevronDown, faRotateRight)
// This variable will hold the reference to
// document's click handler
let handleOutsideClick = (e: any) => {}

createApp(App)
	.component('faIcon', FontAwesomeIcon)
	.mount('#app')
