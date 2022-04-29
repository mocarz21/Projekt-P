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
      formInputs: 'input, select',                                //na co wskazuje  wyszukuje w takim momecie.  inputy i selecty na raz
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
      totalPrice: '.cart__total-price strong, .cart__order-total  .cart__order-price-sum strong',
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
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
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
      thisCart.update();

     

      
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};     

      thisCart.dom.wrapper = element;   
      thisCart.dom.toggleTrigger =thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); 
      thisCart.dom.productList =thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      thisCart.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

      });
      thisCart.dom.productList.addEventListener('updated', function(){ //wiem ze dzieki bubbles mozemy uzyc ale nie zabardzo wiem co sie dzieje czemu to działa wszedzie itd
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event){
        event.preventDefault();
        console.log('event.detail.cartProduct', event.detail.cartProduct);
        thisCart.remove(event.detail.cartProduct);
        
      });
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;
      let payLoad = {};
     
      payLoad.products = [];
      payLoad.address = thisCart.dom.form.address.value;
      payLoad.phone = thisCart.dom.form.phone.value;
      payLoad.totalPrice = thisCart.totalPrice.innerHTML;
      payLoad.subtotalPrice = thisCart.subtotalPrice.innerHTML;
      payLoad.totalNumber = thisCart.totalNumber.innerHTML;
      payLoad.deliveryFee = thisCart.deliveryFee.innerHTML;
      for(let prod of thisCart.products){  
        payLoad.products.push(prod.getData());
      }
      console.log('payLoad', payLoad);
      
      const options ={
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payLoad)
      }
      fetch(url, options);

    }

    add(menuProduct){
      const thisCart = this;

     

      const generatedHTML = templates.cartProduct(menuProduct);   
      

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);   
      
    

      const cartContainer = thisCart.dom.productList;
      

      cartContainer.appendChild(generatedDOM);
      
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    
      thisCart.update();
    }
    update(){
      const thisCart = this;
      const deliveryFee =settings.cart.defaultDeliveryFee;
      thisCart.deliveryFee.innerHTML = deliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
      for(let product of  thisCart.products){
      
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }  
      if(subtotalPrice ==0){
        //empty

      }else{
        thisCart.subtotalPrice.innerHTML = subtotalPrice;
        thisCart.totalPrice.innerHTML = subtotalPrice + deliveryFee; //czemu nie chce mi wstawic wartosci do total ??
        
      }
      
      thisCart.totalNumber.innerHTML = totalNumber;
     
    }
    remove(cartProduct){                                                        //do przejrzenia 
      
      const thisCart = this;
      //1
      cartProduct.dom.wrapper.remove();

      //2

      const indexOfRemoveProduct = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(indexOfRemoveProduct,1);
      
      //3
      thisCart.update();
    }
  }

  class CartProduct{
    constructor(menuProduct, element){                           
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      thisCartProduct.getData();

    }
    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget =thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget); 
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }
    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);    
      thisCartProduct.dom.amountWidget.addEventListener('update', function(){

        
        const howMuch = thisCartProduct.amountWidget.value      ;                                  //czemu tutaj musiałem wstawić  thisCartProduct.amountWidget.value a nie działało  thisCartProduct.dom.amountWidget.value


        thisCartProduct.dom.price.innerHTML = thisCartProduct.priceSingle;
       
        
      });
    }

    remove(){
      const thisCartProduct = this;
      const event = new CustomEvent ('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct

        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(event){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(){
        event.preventDefault();

      });

      thisCartProduct.dom.remove.addEventListener('click', function(){
      //  event.preventDefault();
        thisCartProduct.remove();
        console.log('remove' , thisCartProduct.remove());

      });

    }
    getData(){
      const thisCartProduct = this;
      let orderObject = {};
      orderObject.id = thisCartProduct.id;
      orderObject.amount = thisCartProduct.amount;
      orderObject.price = thisCartProduct.price;
      orderObject.priceSingle = thisCartProduct.priceSingle;
      orderObject.name = thisCartProduct.name;
      orderObject.params = thisCartProduct.params;

      console.log('orderObject ',orderObject);
      return orderObject;
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id , thisApp.data.products[productData]);
      }

    },
    
    initCart: function(){
      const thisApp = this;
      
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);   
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;
      
      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          
          thisApp.data.products = parsedResponse;

          thisApp.initMenu(); 
        });
      console.log('thisapp.data', JSON.stringify(thisApp.data));
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();                            
      
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
      thisProduct.prepareCartProductParams();
     
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
        thisProduct.prepareCartProductParams();
      });
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
          thisProduct.prepareCartProductParams();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
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
      thisProduct.priceSingle = price;
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
    addToCart(){
      
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct()); 
      

    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {id: thisProduct.id , name: thisProduct.data.name , amount: thisProduct.amountWidget.value, 
        priceSingle: thisProduct.priceSingle, price: thisProduct.priceSingle * thisProduct.amountWidget.value, params: thisProduct.prepareCartProductParams() };
      

      return productSummary;
      
    }


    prepareCartProductParams(){


      const params = {};
      
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
    
     

      // for every category (param)...
      for( let paramId in thisProduct.data.params){
        
        

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];      

        params[paramId] = {
          label: param.label,
          options: {}
        };

        // for every option in this category
        for(const optionId in param.options){       
          
         

          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
                                    
           
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
            
          

          if (optionSelected){    

            params[paramId].options[optionId] = optionId;
          }                    
    
        }
      }
      return params;  
    }

    
  }
  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);                        // nie rozumiem za bardzo co tu sie dzieje (rozumiem ze zostaje przekazany argument element zeby był dostępny w metodzie getElements ale po zapisie nie bardzo wiem jak to sie dzieje i do końca po co )
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
     
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
      
      const event = new CustomEvent('update',{bubbles: true});
      thisWidget.element.dispatchEvent(event);
    }
    setValue(value){
      
      const thisWidget = this;               
      thisWidget.value = settings.amountWidget.defaultValue;
      const newValue = parseInt(value);
      console.log('value', value, thisWidget.value, newValue );
     

      if(thisWidget.value !== newValue && !isNaN(newValue)){
        
        if(thisWidget.value > settings.amountWidget.defaultMax){       
          // empty
        }else if(thisWidget.value <= settings.amountWidget.defaultMin){
          // empty
        }else{
          thisWidget.value = newValue;
          
          console.log(' thisWidget.value',  thisWidget.value );
        }    
                                                
      }
      thisWidget.input.value = thisWidget.value; 
      thisWidget.announce();
      console.log('new value', newValue );
      
    }
    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.value);
      
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
        
        
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        console.log('thisWidget.input.value',thisWidget.input.value);
        thisWidget.setValue(Number(thisWidget.value)  + 1);
      
      });
    }
    
  }
  app.init();
}
