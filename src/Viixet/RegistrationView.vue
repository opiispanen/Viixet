<template>
<div class="container">
	<div class="row">
		<div class="col-xs-12 col-md-4 col-md-offset-4">
			<registration></registration>
		</div>
	</div>
</div>
</template>

<script>
import registration from './Registration.vue'

export default {
	name: 'RegistrationView',
	components: {
		registration
	}
}
</script>

