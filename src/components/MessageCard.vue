<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	props: [
		"message"
	]
})
</script>

<template>
<div class="relative w-full p-2">
<img :src="message.user.imageUrl" class="absolute top-4 left-2 rounded-full h-10 w-10" >
<span class="absolute left-16 top-6">
{{ message.user.name }}
</span>
<span class="absolute right-4 top-6">
{{ message.time }}
</span>
<div class="mt-12">
	<p>{{ message.message }}</p>
</div>
</div>
</template>
