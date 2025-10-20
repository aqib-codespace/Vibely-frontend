export const navigateToMarketplaceChat = (
  router,
  productId,
  sellerId,
  options = {}
) => {
  if (!router || !productId || !sellerId) {
    console.error(
      "Missing required parameters for marketplace chat navigation"
    );
    return;
  }

  const url = `/chat?tab=marketplace&productId=${productId}&sellerId=${sellerId}`;

  if (options.newTab) {
    window.open(url, "_blank");
  } else {
    router.push(url);
  }
};

export const navigateToMarketplaceChatWithProduct = (
  router,
  product,
  sellerId,
  options = {}
) => {
  if (!product?._id) {
    console.error("Invalid product for marketplace chat navigation");
    return;
  }

  navigateToMarketplaceChat(router, product._id, sellerId, options);
};

export const createMarketplaceChatUrl = (productId, sellerId) => {
  if (!productId || !sellerId) {
    return "/chat?tab=marketplace";
  }

  return `/chat?tab=marketplace&productId=${productId}&sellerId=${sellerId}`;
};

export const extractMarketplaceChatParams = (searchParams) => {
  if (!searchParams) {
    return { productId: null, sellerId: null };
  }

  return {
    productId: searchParams.get("productId"),
    sellerId: searchParams.get("sellerId"),
    tab: searchParams.get("tab"),
  };
};

export const isMarketplaceChatActive = (searchParams) => {
  return searchParams?.get("tab") === "marketplace";
};
