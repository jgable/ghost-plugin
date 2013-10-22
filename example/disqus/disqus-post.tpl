<div id="disqus_thread"></div>
<script type="text/javascript">
    var disqus_shortname = '<%= shortname %>'; // required: replace example with your forum shortname
    var disqus_identifier = '<%= post.id %>'; // make sure to use the post.id as an identifier, otherwise disqus will use the pages url per default, which might be problematic...

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="http://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
<a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>