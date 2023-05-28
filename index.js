function PromotionEngine(promotions = []) {
  return {
    applyPromotions(invoice) {
      matchedPromotions = promotions.filter(promotion => promotion.condition(invoice))

      appliedPromotionInvoices = matchedPromotions.map(promotion => {
        const clonedInvoice = Object.assign({}, invoice)
        promotion.promote(clonedInvoice)
        clonedInvoice.promote = promotion.promote // Currying promote function with applied promotion invoices
        return clonedInvoice
      })

      let optimizedInvoice = invoice

      appliedPromotionInvoices.forEach(appliedPromotionInvoice => {
        // TODO: Calculate the right subtotal for each line (support percentage)
        const invoiceTotal = appliedPromotionInvoice.lines.map(item => item.qty * item.price).reduce((curr, prev) => curr + prev, 0)
        const optimizedInvoiceTotal = optimizedInvoice.lines.map(item => item.qty * item.price).reduce((curr, prev) => curr + prev, 0)

        // TODO: Check if invoices can be combined
        if (optimizedInvoiceTotal > invoiceTotal) {
          optimizedInvoice = invoice
        }
      })

      // TODO: Promote all promotions
      optimizedInvoice.promote && optimizedInvoice.promote(invoice)
    }
  }
}

module.exports = PromotionEngine