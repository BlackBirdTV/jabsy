<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	props: [
		"name",
		"url",
		"imageUrl"
	]
});
</script>

<template>
<div class="m-2 h-16 w-16 rounded-[2rem] hover:rounded-2xl transition-all duration-500 overflow-hidden cursor-pointer">
<img :src="imageUrl" class="w-full h-full">
</div>
</template>