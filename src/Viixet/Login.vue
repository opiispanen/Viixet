<template>
<div class="container">
	<div class="row">
		<div class="col-xs-12 col-md-4 col-md-offset-4">
			<div class="login-form">
				<div class="form-item">
					<label>
						<span class="form-item--label">
							Username
						</span>
						<input type="text" name="username" v-model="username">
					</label>
				</div>
				<div class="form-item">
					<label>
						<span class="form-item--label">
							Password
						</span>
						<input type="password" name="password" v-model="password">
					</label>
				</div>
				<button 
					class="button button-wide button-primary"
					@click="login">
					Login	
				</button>
				<button 
					v-if="false"
					class="button button-wide"
					@click="testConnection">
					Test connection	
				</button>
				<div>
					If you don't have Viixet.com account, create it
					<router-link :to="{ name: 'SignUp' }">here</router-link>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script>

export default {
	name: 'ViixetLogin',
	data: () => ({
		username: '',
		password: '',
		errors: []
	}),
	methods: {
		login: function() {
			this.$userService
				.login(this.username, this.password)
				.then((response) => {
					const 
						callbackState = this.$userService.callbackState,
						callbacks = this.$userService.callbacks

					callbacks.forEach((callback) => callback())

					this.$router.push(callbackState)

					this.$userService.reset();
				})
				.catch((response) => {
					this.errors.push('Login failed')
				})
		}
	}
}
</script>

