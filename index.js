function PromotionEngine(promotions = []) {
  function calculateSubtotal(item) {
    const { type = 'fixed' } = item

    switch (type) {
      case 'percentage': return (item.qty * item.price) * item.percent / 100 * -1
      case 'fixed':
        default: return item.qty * item.price
    }
  }
  return {
    applyPromotions(invoice) {
      // Q: One promotion can be active for any given instance of product then how about the category?
      // Assumption: All condition check will be mutually exclusive for all the promotions applied to the engine.
      matchedPromotions = promotions.filter(promotion => promotion.condition(invoice))

      appliedPromotionInvoices = matchedPromotions.map(promotion => {
        const clonedInvoice = Object.assign({}, invoice)
        promotion.promote(clonedInvoice)
        clonedInvoice.promote = promotion.promote // Currying promote function with applied promotion invoices
        return clonedInvoice
      })

      let optimizedInvoice = invoice

      appliedPromotionInvoices.forEach(appliedPromotionInvoice => {
        const invoiceTotal = appliedPromotionInvoice.lines.map(calculateSubtotal).reduce((curr, prev) => curr + prev, 0)
        const optimizedInvoiceTotal = optimizedInvoice.lines.map(calculateSubtotal).reduce((curr, prev) => curr + prev, 0)

        if (optimizedInvoiceTotal > invoiceTotal) {
          optimizedInvoice = invoice
        }
      })

      optimizedInvoice.promote && optimizedInvoice.promote(invoice)
    }
  }
}

module.exports = PromotionEngine