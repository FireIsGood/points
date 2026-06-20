<script lang="ts">
	import dayjs from 'dayjs';

	let { timestamp }: { timestamp: Date } = $props();
</script>

<time datetime={timestamp.toISOString()}>{dayjs(timestamp).format('MMM DD, YYYY h:mm:ss a')}</time>
