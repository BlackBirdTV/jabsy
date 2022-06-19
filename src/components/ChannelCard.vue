<script lang="ts">
	import { defineComponent } from "vue";

	type ChannelType = "chat" | "talk";

	export default defineComponent({
		props: {
			"name": {
				type: String,
			},
			"type": {
				type: String,
			}
		}
	});
</script>

<template>
	<div class="w-[calc(100%-1rem)] m-2 p-1 bg-primary hover:bg-blue-600  duration-500 cursor-pointer h-8 rounded-lg">
		<faIcon icon="comment" v-if="type == 'chat'" />
		<faIcon icon="volume-high" v-else-if="type == 'talk'" />
		<span class="absolute left-9 right-1 overflow-hidden">{{ name }}</span>
	</div>
</template>
