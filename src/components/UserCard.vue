<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	props: [
		"name",
		"imageUrl",
		"status"
	],
	data() {
		return {
			showAdvancedInfo: false
		}
	}
});
</script>

<template>
<div class="w-[calc(100%-1rem)] m-2 p-2 h-14 bg-primary hover:bg-blue-600 cursor-pointer  duration-500 rounded-lg relative">
<div @click="showAdvancedInfo = !showAdvancedInfo">
	<img :src="imageUrl" class="aspect-square h-10 rounded-full">
	<span class="absolute left-16 top-2 right-2 overflow-hidden">{{ name }}</span>
	<span class="absolute left-16 top-7 text-sm text-gray-500 right-2 overflow-hidden">{{ status }}</span>
</div>
<div :style="{ height: showAdvancedInfo ? '10rem' : '0rem' }" class="absolute overflow-hidden top-2 right-64 w-56 h-40 rounded-3xl  duration-500 bg-primary">
	<img :src="imageUrl" class="absolute top-0 left-0 w-full h-16 object-cover bg-red-300">
	<img :src="imageUrl" class="aspect-square absolute top-8 left-5 h-16 rounded-full border-4 border-primary">
	<span class="absolute top-16 left-[5.5rem] text-lg w-32 text-ellipsis whitespace-nowrap overflow-hidden">{{ name }}</span>
	<span class="absolute top-[5.5rem] left-[5.5rem] text-base text-gray-500 w-32 text-ellipsis whitespace-nowrap overflow-hidden">{{ status }}</span>
</div>
</div>

</template>