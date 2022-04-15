/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data : ', thisApp.data)            //nie rozumiem czemu this wskazuej
      for(let productData in thisApp.data.products){
        new Product(productData , thisApp.data.products[productData])
      }

    },
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();                            // czemu ma kolor zielony
      thisApp.initMenu();                           // nie rozumiem czemu nie wystarczy odpalenie samej metody initMenu  
    },
  };
  class Product{
    constructor(id , data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.initAccordion();
      console.log('new Product:' , thisProduct)
    }
    renderInMenu(){
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);   

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);       //skąd ten element po kropce(.element) po co jest co daje z kad sie pojawił i dlaczego

      const menuContainer = document.querySelector(select.containerOf.menu);

      menuContainer.appendChild(thisProduct.element)

      
    }
    initAccordion(){
      const thisProduct = this;
      console.log('asdasdasd',this)
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);   
      console.log('mb : ',clickableTrigger )
      /* START: add event listener to clickable trigger on event click */
      clickableTrigger.addEventListener('click', function(event) {            //czemu odwołanie do function(event) czyli to jest odwołanie do funkcji która jest poniżej
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
            
        
        let activeProducts = document.querySelectorAll(select.all.menuProductsActive);   // jak wyszukujemy to co oznaczacza znak > np prduct list > .active
        for(let activProduct of activeProducts){
            activProduct.classList.remove('active')
         
          
        
        /* if there is active product and it's not thisProduct.element, remove class active from it */     //po co skoro używamy póżniej toggle (działa ale nie wiem czemu)
        if(activeProduct !== thisProduct.element ){                             
          activeProduct.classList.remove('active');
        }
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive)
        console.log(this)
      });

    }

    
  }


  app.init();
}
