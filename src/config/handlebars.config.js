import exphbs from 'express-handlebars';

//  template engine configuration with handlebars
const configureHandlebars = (app) => {
  app.engine(
    'handlebars',
    exphbs.engine({
      defaultLayout: 'main',
      runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
      },
    })
  );
  app.set('view engine', 'handlebars');
};

export default configureHandlebars;
