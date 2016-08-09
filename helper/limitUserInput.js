function onlyNum()
{
  if(!((event.keyCode>=48&&event.keyCode<=57)||(event.keyCode>=96&&event.keyCode<=105)))
    event.preventDefault();
} 