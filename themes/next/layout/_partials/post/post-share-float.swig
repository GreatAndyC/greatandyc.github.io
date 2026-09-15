<div
  class="post-share-float"
  data-post-share-float
  data-share-label="{{ __('post.share.label') }}"
  data-share-copied="{{ __('post.share.copied') }}"
  data-share-opened="{{ __('post.share.opened') }}"
  data-share-failed="{{ __('post.share.failed') }}"
>
  <button
    class="post-share-float-button"
    type="button"
    data-share-button
    aria-label="{{ __('post.share.button') }}"
    title="{{ __('post.share.button') }}"
  >
    <i class="fa fa-share-alt" aria-hidden="true"></i>
    <span class="post-share-float-button-text">{{ __('post.share.button') }}</span>
  </button>
  <span class="post-share-float-status" data-share-status role="status" aria-live="polite"></span>
</div>
