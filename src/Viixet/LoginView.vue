<template>
<div class="container">
	<div class="row">
		<div class="col-xs-12 col-md-4 col-md-offset-4">
			<login></login>
		</div>
	</div>
</div>
</template>

<script>
import login from './Login.vue'

export default {
	name: 'LoginView',
	components: {
		login
	}
}
</script>

