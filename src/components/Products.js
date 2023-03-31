import React from "react";
import { Card, Badge, Col, Stack, Row } from "react-bootstrap";

export const Products = (props) => {
  return (
    <Row xs={1} md={3} className="g-4">
      {props.products.map((product) => (
        <Col key={product.index}>
          <Card className="h-100">
            <Card.Header>
              <Stack direction="horizontal" gap={2}>
                <Badge bg="secondary" className="ms-auto">
                  {product.index} ID
                </Badge>

                <Badge bg="secondary" className="ms-auto">
                   {product.price / 1000000000000000000}cUSD
                </Badge>

                <Badge bg="secondary" className="ms-auto">
                  {product.sold} Sold
                </Badge>
              </Stack>
            </Card.Header>

            <div className=" ratio ratio-4x3">
              <img
                src={product.image}
                alt={product.description}
                style={{ objectFit: "cover" }}
              />
            </div>

            <Card.Body className="d-flex  flex-column text-center">
            <Card.Title className="flex-grow-1">
                {product.name}
              </Card.Title>

              <Card.Text className="flex-grow-1">
                {product.description}
              </Card.Text>
             { props.walletAddress !== product.owner &&(
              <button
                    type="button"
                    onClick={() => props.buyProduct(product.index)}
                    class="btn btn-dark mt-1"
                  >
                    Buy
                  </button>
)}
             
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
