<template>
<div class="container">
	<div class="row">
		<div class="col-xs-8 col-xs-offset-2">
			<h1>Vue-Express Viixet boilerplate</h1>
			<p>
				Okay okay, we're all hungry but we're all gonna get to our hot plates soon enough.
			</p>
			<p>
				What is this? This is a personal project to build a full stack vue-express-nodejs-mysql
				framework for small project. It's always evolving, maybe not the best idea to pick this 
				up and use in production.
			</p>
			<p>
				The build size might be pretty big (over 150 kb). Consider using CDN services on vendor code
				like Vue itself instead of making a vendor bundle with webpack.
			</p>
		</div>
	</div>
</div>
</template>

<script>
import RestService from '../services/RestService.js'

const Posts = new RestService('posts')

export default {
	name: 'app',
	data: () => ({
		posts: []
	}),
	created() {
		// this is basicly a demo that the server works
		Posts.post({
			content: 'Cool Viixet note post'
		}).then((response) => {
			const data = response.data;

			Posts.get(data.post.id)
				.then((response) => {
					const data = response.data;
					console.log(data.post);
				})
		})
	}
}
</script>
