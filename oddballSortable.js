/**
 * The Oddball Sortable
 * A groupable and light-weight list sorter, with quick, clickable sorting
 * -------------------------------------------------------------------
 * @version 0.0.1
 * @author Oliver Hepworth-Bell (@ohepworthbell)
 * @license The MIT License (MIT)
 * @todo Finish the plugin and fix all bugs
 * @todo Save the state of the list at the start of each cycle, so you can undo an edit
 * @todo Add an array, so you can cycle back through several iterations of an edit (undo, basically)
 */

/* set up base variables */
var active, clicker, pause, passhandle, stack=false, rootchild, current=false, touch=false, moved=false, shift=false, shift = false, x, y, startY, moveDist, tempRoot, scrolly, movedElem, ghost, ghostSpace, ghostHeight, newEQ=0, oldEQ=0, indexOf;

/* get the $(root) element for the sortable */
var root = '.sortable';

/* get the draggable elements that are active - set to false for all child elements (default) */
var enabled = false;

/* set what causes the element to be draggable - set to false for all child elements (default) */
var handle = '.name';

/* set the style for ghost elements */
var ghostClass = "-webkit-box-sizing: -moz-border-box; box-sizing: border-box; box-sizing: border-box; background: rgba(0,0,0,0.2), padding: 0 !important; border: 2px dashed rgba(0,0,0,0.2) !important; border-radius: 7px; margin: 0 !important; width: 100%;";


/* test click time - longer click times cancel out the highlight */
clicktime = function(i) {
  clicker = setInterval(function() {
    i++;

    if(i>10) {
      pause = true;
    } else {
      pause = false;
    }
  },30);
}

$(window).on('ready load scroll', function() {
  scrolly = $(window).scrollTop();
});

/* test for shift */
$(document).on('keyup keydown', function(e) {
  shift = e.shiftKey;
});

/* test for touch-devices, and how long something has been pressed for */
function beginInteraction(hasTouch,e) {
  moved=false;

  if(hasTouch) {
    // console.log('You are using a touch device on element ' + stack);
    startY = e.originalEvent.touches[0].pageY;
    getPosition(true,e);
  } else {
    // console.log('You are using a mouse on element ' + stack);
    startY = e.pageY;
    getPosition(false,e);
  }

  // moveItem(x,y);

  clicktime(0);
}

/* check to toggle classes */
function makeActive(elem) {
  if(shift || (touch && pause)) {
    elem.toggleClass('oddballActive');
  } else {
    $(root).find('.oddballActive').removeClass('oddballActive');
    elem.toggleClass('oddballActive');
  }
}

/* function to get positions of elements (switches for touch and non-touch devices) */
function getPosition(hasTouch) {
  $(window).on('mousemove', function(e) {
    if(active) {
      if(hasTouch) {
        x = e.originalEvent.touches[0].pageX;
        y = e.originalEvent.touches[0].pageY;
      } else {
        x = e.pageX;
        y = e.pageY;
      }

      moveDist = Math.abs(y-startY);
      if(moveDist>20) {

        /* perform initial movement checks */
        if(!moved) {
          tempRoot.css('min-height',tempRoot.height()+'px');
          current.addClass('oddballActive');

          movedElem="";
          ghostHeight=0;
          tempRoot.find(".oddballActive").each(function() {
            $(this).removeClass("oddballActive").wrap("<div></div>");
            movedElem += $(this).parent().html();
            ghostHeight+=$(this).outerHeight();
            $(this).unwrap().remove();
          });

          tempRoot.append("<div class='oddballGhost'></div>");
          ghost=tempRoot.find(".oddballGhost");
          ghost.html(movedElem);

          ghostSpace = "<div class='oddballSpacer' style='"+ghostClass+"height:"+ghostHeight+"px;'></div>";

          indexOf = tempRoot.children().length - 1;
        }
        moveItem(x,y);
        moved=true;
      }
    }
  });
}

function placeSpacer(newEQ) {
  tempRoot.find('.oddballSpacer').remove();
  tempRoot.children().eq(newEQ).before(ghostSpace);
};

/* perform any draggable movemenets */
function moveItem(x,y) {
  tempRoot.children().each(function() {
    var thisstart = $(this).offset().top;
    var thisend = thisstart+$(this).outerHeight();
    if(y>thisstart && y<thisend) {
      newEQ = $(this).index();

      /* make sure the index isn't greater than the number of items in the list (combats the ghost elements being treated as children) */
      if(newEQ>indexOf) {
        newEQ=indexOf;
      }
    }

    if(newEQ!==oldEQ) {
      placeSpacer(newEQ);
      oldEQ=newEQ;

      console.log(newEQ+' of '+indexOf);
    }
  });

  ghost.css({
    'position': 'fixed',
    'top': (y-scrolly)+'px',
    'left': tempRoot.offset().left+'px',
    'opacity': '0.5'
  });
}

/* remove highlighting on the list, for easier usage */
if(handle) {
 $(root).find(handle).css({
   "-webkit-user-select": "none",
      "-moz-user-select": "none",
       "-ms-user-select": "none",
           "user-select": "none"
 });
} else {
 $(root).children().css({
   "-webkit-user-select": "none",
      "-moz-user-select": "none",
       "-ms-user-select": "none",
           "user-select": "none"
 });
}

/* test for touch or non-touch (touch true or false) */
$(root).on('touchstart', function() {
  touch=true;
});

/* remove classes on click-outside of element */
$('html').on('touchstart mousedown', function() {
  $('.oddballActive').removeClass('oddballActive');
});

/* also remove the class if keyPress is up is 'escape' */
$(document).on('keyup', function(e) {
  if(e.keyCode === 27) {
    e.preventDefault();
    $('.oddballActive').removeClass('oddballActive');
  }
});

function resetVariables(current) {
  active=true;
  movedElem="";
  ghostHeight=0;
  pause=false;
  stack=current.index();
  moved=false;
};

/* set up a few defaults, and test whether an element has been clicked on...
 * use the if(children) to determine whether to select all children, or select divs */
if(enabled) {
  $(root).on('touchstart mousedown', enabled, function(e) {
    e.stopPropagation();
    e.preventDefault();
    tempRoot = $(this).closest(root);
    current=$(this);
    resetVariables(current);
    beginInteraction(touch,e);
  });
} else {
  $(root).on('touchstart mousedown', '> *', function(e) {
    e.stopPropagation();
    e.preventDefault();
    tempRoot = $(this).closest(root);
    current=$(this);
    resetVariables(current);
    beginInteraction(touch,e);
  });
}

/* test to see whether a class should be added to the element */
$(window).on('mouseup touchend', function() {
  active=false;

  clearInterval(clicker);

  /* check to see if a class should be added */
  if(current && (touch || !pause) && !moved) {
    makeActive(current);
  } else if(moved) {
    tempRoot.find('.oddballSpacer').remove();
    tempRoot.children().eq(newEQ).before(movedElem);
    tempRoot.css('min-height','auto');
    ghost.remove();
    movedElem="";
  }

  /* reset dragger variables */
  current=false;
  pause=false;
  stack=false;
  moved=false;
});

/* cancel all functions of button, input or link is pressed? */
$('html').on('mousedown', 'button', function(e) {
  e.stopPropagation();
  return true;
});
$('html').on('mousedown', 'input', function(e) {
  e.stopPropagation();
  return true;
});
$('html').on('mousedown', 'a', function(e) {
  e.stopPropagation();
  return true;
});
