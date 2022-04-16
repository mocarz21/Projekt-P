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
      formInputs: 'input, select',                                //na co wskazuje  wyszukuje w takim momecie inputy i selecty na raz
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
      console.log('thisApp.data : ', thisApp.data);            //nie rozumiem czemu this wskazuej patrz initData
      for(let productData in thisApp.data.products){
        new Product(productData , thisApp.data.products[productData]);
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

      thisApp.initData();                            
      thisApp.initMenu();                           // nie rozumiem czemu nie wystarczy odpalenie samej metody initMenu       this wslkazuje na app
    },
  };
  class Product{
    constructor(id , data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm()
      thisProduct.processOrder()
      console.log('new Product:' , thisProduct);
    }
    renderInMenu(){
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);   

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);       //skąd ten element po kropce(.element) po co jest co daje z kad sie pojawił i dlaczego tu własnie definiujemy ten element

      const menuContainer = document.querySelector(select.containerOf.menu);

      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    }
    initAccordion(){
      const thisProduct = this;
      
      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);   
      
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {            

        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
            
        
        let activeProducts = document.querySelectorAll(select.all.menuProductsActive);   // jak wyszukujemy to co oznaczacza znak > np prduct list > .active
        for(let activProduct of activeProducts){
          
         111
         console.log('a',activProduct)
         console.log('b',thisProduct.element)
          
        
          /* if there is active product and it's not thisProduct.element, remove class active from it */     //po co skoro używamy póżniej toggle (czemu bez tego zapisu nie działa toggle) (działa ale nie wiem czemu)
          if( activProduct && (activProduct != thisProduct.element) ){                             
           activProduct.classList.remove('active');
          }        
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        console.log(this);
      });
    }
    initOrderForm(){
      const thisProduct = this
      console.log('initOrderForm', thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
    }
    processOrder(){
      const thisProduct = this

      

      

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
      

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for( let paramId in thisProduct.data.params){
        console.log('thisProduct.data.params ',thisProduct.data.params)             // mam problem co na co wskazuje naprzykłąd jak mamy thisProduct.data.params a thisProduct.data.params[param]
        console.log('paramId', paramId)

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId]                          
        console.log('thisProduct.data.params[paramId]   ',param)
        // for every option in this category
        for(const optionId in param.options){       
          console.log('===================optionId',optionId)                                 //czemu musimy zrobić od param.options a nie wyszukuje po  thisProduct.data.params.options
          console.log('===========================param.options[optionId]== ',param.options[optionId])
          
          



          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId]
          console.log('param.options[optionId]', option)
          console.log('======================================formData[paramId]', formData[paramId])
          console.log('formData[paramId].includes(optionId)',formData[paramId].includes(optionId))                                  //console.log('formData[paramId].includes(optionId)', param.options[optionId].includes('default')) przy takim zapisie nie chciało mi isc dalej
          
          
          /*

          if ( formData[paramId] && formData[paramId].includes('optionId')){                 //sprawdzam czy sa składniki  sprawdz czy zawieraja optionId (a czemu maja nie zawierac kiedy sie miały)   //nie rozumiem kiedy na co wskazuje jezeli mamy naprzykład o co tutaj chodzi formData[paramId].includes(optionId) z kad on wie ze w tablicy ktora zawiera pomidor pomidor ma default ustawione na true
              
            price = price 

            if(param.options[optionId].default == true){
                console.log('superrrrrrrrrrrrrrrrrr')
            }



          }else if (option.default != true ){

            price += option.price

          }else if (option.default == true ){
          

            price -= option.price
          }
          
          */  
        }

      }
    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;     //skad sie wzieło priceElem ?
    console.log('price', price)
    }
  }
   app.init();
}
