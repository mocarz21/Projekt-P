/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';
  

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input:'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];  

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('newCart ',thisCart);

      
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {}     //jak to rozumieć

      thisCart.dom.wrapper = element   //?? co tu się stało  (stworzył klucz obiektu wrappeer i dodał do niego element)
      thisCart.dom.toggleTrigger =thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); 


    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

      });


    }

  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      
      for(let productData in thisApp.data.products){
        new Product(productData , thisApp.data.products[productData]);
      }

    },
    initCart: function(){
      const thisApp = this;
      
      const cartElem = document.querySelector(select.containerOf.cart)
      thisApp.cart = new Cart(cartElem)   //po co początek thisApp. cart nie wystarczyło by new Cart(carElem)
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
      thisApp.initCart();
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
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();                     
      thisProduct.processOrder();
      console.log('new Product:' , thisProduct);
    }
    renderInMenu(){
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);   

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);       

      const menuContainer = document.querySelector(select.containerOf.menu);

      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);         // Spróbuj wprowadzić ten sam pomysł w klasie Product. Tak, żeby wszystkie referencje do elementów DOM były "schowane" w obiekcie dodatkowym obiekcie thisProduct.dom.
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
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
            
        
        let activeProducts = document.querySelectorAll(select.all.menuProductsActive);   
        for(let activProduct of activeProducts){
          
         
          
        
          /* if there is active product and it's not thisProduct.element, remove class active from it */     
          if( activProduct && (activProduct != thisProduct.element) ){                             
            activProduct.classList.remove('active');
          }        
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        
      });
    }
    initOrderForm(){
      const thisProduct = this;
      

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
      const thisProduct = this;

      

      

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
    
      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for( let paramId in thisProduct.data.params){
        

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];                          
        
        // for every option in this category
        for(const optionId in param.options){       
          
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];                            
          
         
          let image = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
            

          if (optionSelected){                 
              
            if(option.default == true){
              price += option.price;   
            }
             
          }else if (option.default != true ){
                    
            price -= option.price;
              
          }
          if(optionSelected && image){
            image.classList.add('active');
            
          }else if(image){
            image.classList.remove('active');
          }
   
        }

      }
      // update calculated price in the HTML

      price *=thisProduct.amountWidget.value; //czemu w ten sposób

      thisProduct.priceElem.innerHTML = price;     
      
    }
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);    //skad się bierze amountWidget ? 
      thisProduct.amountWidgetElem.addEventListener('update', function(){
        thisProduct.processOrder();
      });

    }
  }
  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);                        // nie rozumiem za bardzo co tu sie dzieje (rozumiem ze zostaje przekazany argument element zeby był dostępny w metodzie getElements ale po zapisie nie bardzo wiem jak to sie dzieje i do końca po co )
      thisWidget.setValue();
      thisWidget.initActions();

      console.log('thisWidget ', thisWidget);
      console.log('element ', element);
    }
    getElements(element){                               //czemu po tym kroku thisWidget pokazuje konkretny element w console a wczesniej pokazywało pusty obiekt a teraz wskazuje na diva ?
      const thisWidget = this;
      
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    announce(){
      const thisWidget = this;
      
      const event = new Event('update');
      thisWidget.element.dispatchEvent(event);
    }
    setValue(value){
      
      const thisWidget = this;               //czy zależnie od klasy musimy do this przypisywac inna nazwę
      thisWidget.value = settings.amountWidget.defaultValue;
      const newValue = parseInt(value);
      

      if(thisWidget.value !== newValue && !isNaN(newValue)){
        
        if(thisWidget.input.value > settings.amountWidget.defaultMax){       
          // empty
        }else if(thisWidget.input.value <= settings.amountWidget.defaultMin){
          // empty
        }else{
          thisWidget.value = newValue;
          console.log('as',thisWidget.value);
        }
 
        thisWidget.input.value = thisWidget.value;         //czemu musi byc w petli                                              
      }
      thisWidget.announce();
      
      //      nie wiem gdzie mam to wstawic  >  thisWidget.setValue(thisWidget.input.value);   
    }
    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
        console.log('zmiana');
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value -= 1);
        
        
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value =Number(thisWidget.input.value) + 1);
        console.log('zmiana', thisWidget.input.value);
      });
    }
    
  }
  app.init();
}
