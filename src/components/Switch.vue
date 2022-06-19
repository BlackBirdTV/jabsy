<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	props: [
		"enabled"
	],
	data() {
		return { 
			switchThumbOffset: this.enabled ? '1rem' : '0rem'
		}
	},
	methods: {
		getState() {
			return this.switchThumbOffset != '0rem';
		}
	}
});
</script>

<template>
<div @click="switchThumbOffset = switchThumbOffset != '0rem' ? '0rem' : '1rem'; $emit('switched')" :style="{'background-color': switchThumbOffset === '0rem' ? 'rgb(71, 85, 105)' : 'rgb(34, 197, 94)'}" class="relative group  duration-500 bg-slate-600 w-9 h-5 rounded-full cursor-pointer overflow-hidden">
	<div :style="{left: switchThumbOffset}" class="h-[1rem] w-[1rem] absolute rounded-full  duration-300 shadow-sm m-[0.125rem]"></div>
</div>
</template>