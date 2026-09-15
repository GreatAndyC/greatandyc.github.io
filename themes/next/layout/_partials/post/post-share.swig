<div
  class="post-share"
  data-post-share
  data-share-label="{{ __('post.share.label') }}"
  data-share-copied="{{ __('post.share.copied') }}"
  data-share-opened="{{ __('post.share.opened') }}"
  data-share-failed="{{ __('post.share.failed') }}"
>
  <span class="post-share-label">{{ __('post.share.label') }}</span>
  <button class="post-share-button post-share-button-primary" type="button" data-share-button>
    <i class="fa fa-share-alt" aria-hidden="true"></i>
    <span>{{ __('post.share.button') }}</span>
  </button>
  <button class="post-share-button" type="button" data-share-copy>
    <i class="fa fa-link" aria-hidden="true"></i>
    <span>{{ __('post.share.copy') }}</span>
  </button>
  <span class="post-share-status" data-share-status role="status" aria-live="polite"></span>
</div>
