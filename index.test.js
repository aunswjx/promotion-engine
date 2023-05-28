const PromotionEngine = require('./')

describe('PromotionEngine', () => {
  describe('when promotion apply to a specific item', () => {
    describe('and specific item exists in the invoice', () => {
      test('it should add promotion item to invoice', () => {
        const invoice = {
          id: 1,
          lines: [
            {
              item: 'Apple',
              category: 'Fruit',
              qty: 3,
              price: 2.5
            },
            {
              item: 'Banana',
              category: 'Fruit',
              qty: 3,
              price: 2.5
            }
          ]
        }
        const promotions = [
          {
            name: 'Apply to apple',
            condition: (toBeApplyInvoice) => toBeApplyInvoice.lines.find(lineItem => lineItem.item == 'Apple'),
            promote: (toBePromoteInvoice) => {
              toBePromoteInvoice.lines.push({
                item: 'Apple discount',
                category: 'Promotion',
                qty: 1,
                price: -2.5
              })
            }
          },
        ]
        const promotionEngine = new PromotionEngine(promotions)

        promotionEngine.applyPromotions(invoice)

        expect(invoice.lines).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              item: 'Apple discount',
              category: 'Promotion',
              qty: 1,
              price: -2.5
            })
          ])
        )
      })
    })
    describe('and specific item does not exist in the invoice', () => {
      test('it should not apply promotion item to invoice', () => {
        const invoice = {
          id: 1,
          lines: [
            {
              item: 'Apple',
              category: 'Fruit',
              qty: 3,
              price: 2.5
            },
            {
              item: 'Banana',
              category: 'Fruit',
              qty: 3,
              price: 2.5
            }
          ]
        }
        const promotions = [
          {
            name: 'Apply to orange',
            condition: (toBeApplyInvoice) => toBeApplyInvoice.lines.find(lineItem => lineItem.item == 'Orange'),
            promote: (toBePromoteInvoice) => {
              toBePromoteInvoice.lines.push({
                item: 'Orange discount',
                category: 'Promotion',
                qty: 1,
                price: -2.5
              })
            }
          },
        ]
        const promotionEngine = new PromotionEngine(promotions)

        promotionEngine.applyPromotions(invoice)

        expect(invoice.lines).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              item: 'Orange discount',
              category: 'Promotion',
              qty: 1,
              price: -2.5
            })
          ])
        )
        expect(invoice.lines).toEqual(invoice.lines)
      })
    })
  })
  describe('when promotion apply to a specific category', () => {
    describe('and specific category exists in the invoice', () => {
      test('it should add promotion item to invoice', () => {
        const invoice = {
          id: 1,
          lines: [
            {
              item: 'Apple',
              category: 'Fruit',
              qty: 3,
              price: 2.5
            },
            {
              item: 'Banana',
              category: 'Fruit',
              qty: 3,
              price: 2.5
            }
          ]
        }
        const promotions = [
          {
            name: 'Apply to fruit',
            condition: (toBeApplyInvoice) => toBeApplyInvoice.lines.find(lineItem => lineItem.category == 'Fruit'),
            promote: (toBePromoteInvoice) => {
              toBePromoteInvoice.lines.push({
                item: 'Fruit discount',
                category: 'Promotion',
                qty: toBePromoteInvoice.lines.filter(item => item.category == 'Fruit').map(item => item.qty).reduce((curr, prev) => curr + prev, 0),
                price: -2.5
              })
            }
          },
        ]
        const promotionEngine = new PromotionEngine(promotions)

        promotionEngine.applyPromotions(invoice)

        expect(invoice.lines).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              item: 'Fruit discount',
              category: 'Promotion',
              qty: 6,
              price: -2.5
            })
          ])
        )
      })
    })
    describe('and specific category does not exist in the invoice', () => {
      test('it should not add promotion item to invoice', () => {
        const invoice = {
          id: 1,
          lines: [
            {
              item: 'Apple',
              category: 'Fruit',
              qty: 3,
              price: 2.5
            },
            {
              item: 'Banana',
              category: 'Fruit',
              qty: 3,
              price: 2.5
            }
          ]
        }
        const promotions = [
          {
            name: 'Apply to vegetable',
            condition: (toBeApplyInvoice) => toBeApplyInvoice.lines.find(lineItem => lineItem.category == 'Vegetable'),
            promote: (toBePromoteInvoice) => {
              toBePromoteInvoice.lines.push({
                item: 'Vegetable discount',
                category: 'Promotion',
                qty: 1,
                price: -2.5
              })
            }
          },
        ]
        const promotionEngine = new PromotionEngine(promotions)

        promotionEngine.applyPromotions(invoice)

        expect(invoice.lines).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              item: 'Vegetable discount',
              category: 'Promotion',
              qty: 1,
              price: -2.5
            })
          ])
        )
        expect(invoice.lines).toEqual(invoice.lines)
      })
    })
  })
  describe('when promotion apply to a specific condition', () => {
    describe('when invoice matches with a specific condition', () => {
      test('it should add promotion item to invoice', () => {
        const invoice = {
          id: 1,
          lines: [
            {
              item: 'Banana',
              category: 'Fruit',
              qty: 6,
              price: 2.5
            },
          ]
        }
        const promotions = [
          {
            name: 'Buy 2 bananas get 1 free',
            condition: (toBeApplyInvoice) => toBeApplyInvoice.lines.find(lineItem => lineItem.item == 'Banana' && lineItem.qty > 3),
            promote: (toBePromoteInvoice) => {
              toBePromoteInvoice.lines.push({
                item: 'Buy 2 get 1 free',
                category: 'Promotion',
                qty: toBePromoteInvoice.lines.find(lineItem => lineItem.item == 'Banana').qty / 3,
                price: -2.5
              })
            }
          },
        ]
        const promotionEngine = new PromotionEngine(promotions)

        promotionEngine.applyPromotions(invoice)

        expect(invoice.lines).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              item: 'Buy 2 get 1 free',
              category: 'Promotion',
              qty: 2,
              price: -2.5
            })
          ])
        )
      })
    })
    describe('when invoice does not match with a specific condition', () => {
      test('it should not add promotion item to invoice', () => {
        const invoice = {
          id: 1,
          lines: [
            {
              item: 'Banana',
              category: 'Fruit',
              qty: 6,
              price: 2.5
            },
          ]
        }
        const promotions = [
          {
            name: 'Buy 2 apples get 1 free',
            condition: (toBeApplyInvoice) => toBeApplyInvoice.lines.find(lineItem => lineItem.item == 'Apple' && lineItem.qty > 3),
            promote: (toBePromoteInvoice) => {
              toBePromoteInvoice.lines.push({
                item: 'Buy 2 get 1 free',
                category: 'Promotion',
                qty: toBePromoteInvoice.lines.find(lineItem => lineItem.item == 'Apple').qty / 3,
                price: -2.5
              })
            }
          },
        ]
        const promotionEngine = new PromotionEngine(promotions)

        promotionEngine.applyPromotions(invoice)

        expect(invoice.lines).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              item: 'Buy 2 get 1 free',
              category: 'Promotion',
            })
          ])
        )
        expect(invoice.lines).toEqual(invoice.lines)
      })
    })
  })
  describe('when multi promotions can be applied to a single invoice', () => {
    test('it should add only optimized promotion item to invoice', () => {
      const invoice = {
        id: 1,
        lines: [
          {
            item: 'Banana',
            category: 'Fruit',
            qty: 5,
            price: 2.5
          },
        ]
      }
      const promotions = [
        {
          name: 'Buy 2 bananas get 1 free',
          condition: (toBeApplyInvoice) => toBeApplyInvoice.lines.find(lineItem => lineItem.item == 'Banana' && lineItem.qty > 3),
          promote: (toBePromoteInvoice) => {
            toBePromoteInvoice.lines.push({
              item: 'Buy 2 get 1 free',
              category: 'Promotion',
              qty: toBePromoteInvoice.lines.find(lineItem => lineItem.item == 'Banana').qty / 3,
              price: -2.5
            })
          }
        },
        {
          name: 'Buy 5 bananas discount 10',
          condition: (toBeApplyInvoice) => toBeApplyInvoice.lines.find(lineItem => lineItem.item == 'Banana' && lineItem.qty >= 5),
          promote: (toBePromoteInvoice) => {
            toBePromoteInvoice.lines.push({
              item: 'Buy 5 discount 10',
              category: 'Promotion',
              qty: 1,
              price: -10
            })
          }
        },
      ]
      const promotionEngine = new PromotionEngine(promotions)

      promotionEngine.applyPromotions(invoice)

      expect(invoice.lines).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: 'Buy 5 discount 10',
            category: 'Promotion',
            qty: 1,
            price: -10
          })
        ])
      )
      expect(invoice.lines).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: 'Buy 2 get 1 free',
            category: 'Promotion',
            qty: 1,
            price: -2.5
          })
        ])
      )
      expect(invoice.lines.length).toEqual(3)
    })
  })
})