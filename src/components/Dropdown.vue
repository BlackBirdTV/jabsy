<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	props: [
		"options",
		"default"
 	],
	data() {
		return { 
			current: this.current || this.default || this.options[0],
			index: this.options.indexOf(this.default),
			dropdownHeight: (2 * this.options.length).toString() + 'rem',
			showdropdown: false
		}
	},
	methods: {
		getSelectedItem() {
			return this.current
		},
		getSelectedIndex() {
			return this.index
		},
		setSelectedItem(name: string) {
			this.index = this.options.indexOf(name)
			this.current = this.options[this.index]
		},
		setSelectedIndex(i: number) {
			this.current = this.options[i]
			this.index = i
		},
		dropdownExtended() {
			document.addEventListener('click', this.handleClick)
		},
		handleClick(e: Event) {
			if (this.$refs.dropdownContainer && !(this.$refs.dropdownContainer as Node).contains(e.target as Node)) {
				this.showdropdown = false
				document.removeEventListener('click', this.handleClick)
			}
		}
	}
});
</script>

<template>
<div ref="dropdownContainer" class="relative">
	<div class="relative bg-secondary  w-32 h-7 m-2 rounded-lg p-1">
		<span class="relative overflow-hidden">{{ current }}</span>
		<a @click="dropdownExtended(); showdropdown = !showdropdown" :style="{transform: `rotate(${showdropdown ? 0 : '90deg'})`}" class="transition-transform duration-500 leading-5 absolute right-2 cursor-pointer"><faIcon icon="chevron-down" /></a>
	</div>
	<div ref="dropdown" :style="{'height': showdropdown ? dropdownHeight : 0 }" class="text-base bg-secondary transition-[height] duration-500 flex flex-col absolute rounded-lg left-2 top-10 shadow-2xl w-32 z-50 overflow-hidden">
		<a class="m-1 cursor-pointer" @click="current = option; index = i; showdropdown = false; $emit('selection-changed')" v-for="(option, i) in options">{{ option }}</a>
	</div>
</div>
</template>
