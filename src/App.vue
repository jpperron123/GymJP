<style scoped></style>

<template>
	<header>
		<div class="wrapper">
			<HelloWorld class="bg-red-500" msg="You did it!" />
		</div>
	</header>

	<main>
		<TheWelcome />
	</main>
</template>

<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>
