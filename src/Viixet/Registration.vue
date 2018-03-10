<template>
<div class="container">
	<div class="row">
		<div class="col-xs-12 col-md-4 col-md-offset-4">
			<div class="login-form">
				<div class="form-item">
					<label>
						<span class="form-item--label">
							Email
						</span>
						<input type="email" name="email" v-model="email">
					</label>
				</div>
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
				<div class="form-item">
					<span class="badge badge-danger" v-if="passwordLegit && passwordRepeat.length">
						Passwords don't match
					</span>
					<label>
						<span class="form-item--label">
							Repeat password
						</span>
						<input type="password" name="password-repeat" v-model="passwordRepeat">
					</label>
				</div>
				<div class="row">
					<div class="col-xs-6">
						<button 
							class="button button-wide button-primary"
							@click="registration">
							Save	
						</button>
					</div>
					<div class="col-xs-6">
						<router-link 
							class="button button-wide"
							:to="{ name: 'SignIn' }">
							Cancel
						</router-link>
						<button 
							class="button button-wide"
							v-if="false"
							@click="$emit('ViixetRegistration.cancel')">
							Cancel	
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script>
export default {
	name: 'ViixetRegistration',
	data: () => ({
		username: '',
		password: '',
        passwordRepeat: '',
        email: ''
	}),
    computed: {
        passwordLegit: function() {
            return this.password !== this.passwordRepeat;
        }
    },
	methods: {
		registration: function() {
            if (!this.passwordLegit)
                return false;

			this.$userService
				.registration({
					username: this.username,
					password: this.password,
					email: this.email
				}).then((response) => {
					console.log(response);
				})
		}
	}
}
</script>

